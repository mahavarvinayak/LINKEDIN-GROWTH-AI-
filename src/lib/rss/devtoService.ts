import type { RssArticle } from "./types";

const DEVTO_API_BASE = "https://dev.to/api";
const DEVTO_API_KEY = process.env.DEV_TO_API_KEY || "";

export interface DevtoArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  tag_list: string[];
  user: {
    name: string;
  };
}

/**
 * Fetch latest articles from Dev.to
 * Requires DEV_TO_API_KEY environment variable
 * If no API key, still works but without auth (fewer requests)
 */
export async function fetchDevtoArticles(limit: number = 15, tag: string = "technology"): Promise<RssArticle[]> {
  try {
    // Build query params
    const params = new URLSearchParams({
      tag: tag,
      per_page: Math.min(limit, 30).toString(),
    });

    const headers: Record<string, string> = {
      "Accept": "application/vnd.forem.v1+json",
    };

    // Add API key if available (increases rate limit)
    if (DEVTO_API_KEY) {
      headers["api-key"] = DEVTO_API_KEY;
    }

    const response = await fetch(`${DEVTO_API_BASE}/articles?${params}`, {
      headers,
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      console.error(`Dev.to API error: ${response.status}`);
      return [];
    }

    const articles: DevtoArticle[] = await response.json();

    return articles
      .filter((article) => article.title && article.title.trim().length > 0)
      .filter((article) => article.description && article.description.trim().length > 20) // Only substantive articles
      .map((article) => ({
        title: article.title,
        link: article.url,
        date: article.published_at,
        description: article.description.trim().substring(0, 150),
        source: `Dev.to (${article.user.name})`,
      }));
  } catch (error) {
    console.error("Error fetching Dev.to articles:", error);
    return [];
  }
}

/**
 * Fetch articles by multiple tags
 */
export async function fetchDevtoArticlesByTags(tags: string[], limit: number = 20): Promise<RssArticle[]> {
  const articles: RssArticle[] = [];
  const articlesPerTag = Math.floor(limit / tags.length);

  for (const tag of tags) {
    const tagArticles = await fetchDevtoArticles(articlesPerTag, tag);
    articles.push(...tagArticles);
  }

  return articles.slice(0, limit);
}

/**
 * Fetch trending Dev.to articles
 */
export async function fetchDevtoTrending(limit: number = 15): Promise<RssArticle[]> {
  try {
    const params = new URLSearchParams({
      per_page: Math.min(limit, 30).toString(),
      state: "fresh",
    });

    const headers: Record<string, string> = {
      "Accept": "application/vnd.forem.v1+json",
    };

    if (DEVTO_API_KEY) {
      headers["api-key"] = DEVTO_API_KEY;
    }

    const response = await fetch(`${DEVTO_API_BASE}/articles?${params}`, {
      headers,
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return [];
    }

    const articles: DevtoArticle[] = await response.json();

    return articles
      .filter((article) => article.title && article.title.trim().length > 0)
      .filter((article) => article.description && article.description.trim().length > 20) // Only substantive articles
      .map((article) => ({
        title: article.title,
        link: article.url,
        date: article.published_at,
        description: article.description.trim().substring(0, 150),
        source: `Dev.to Trending (${article.user.name})`,
      }));
  } catch (error) {
    console.error("Error fetching Dev.to trending:", error);
    return [];
  }
}
