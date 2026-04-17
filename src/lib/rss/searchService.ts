import type { RssArticle } from "./types";
import { fetchLatestRssArticles } from "./rssService";
import { fetchHackerNewsStories } from "./hackerNewsService";
import { fetchDevtoArticles } from "./devtoService";
import { fetchGithubTrendingViaAPI } from "./githubService";

export interface SearchResult {
  articles: RssArticle[];
  query: string;
  totalFound: number;
  sources: string[];
}

/**
 * Search trending articles across all 4 sources by keyword
 * Returns top 5 matching results
 */
export async function searchTrendingArticles(
  query: string,
  limit: number = 5
): Promise<SearchResult> {
  if (!query || query.trim().length < 2) {
    return {
      articles: [],
      query,
      totalFound: 0,
      sources: [],
    };
  }

  const normalizedQuery = query.toLowerCase().trim();

  try {
    // Fetch from all 4 sources in parallel
    const [rssArticles, hnArticles, devtoArticles, githubArticles] = await Promise.all([
      fetchLatestRssArticles().catch((error) => {
        console.error("RSS search error:", error);
        return [];
      }),
      fetchHackerNewsStories(30).catch((error) => {
        console.error("HN search error:", error);
        return [];
      }),
      fetchDevtoArticles(30, normalizedQuery).catch((error) => {
        console.error("DevTo search error:", error);
        return [];
      }),
      fetchGithubTrendingViaAPI(30, normalizedQuery).catch((error) => {
        console.error("GitHub search error:", error);
        return [];
      }),
    ]);

    // Combine all articles
    const allArticles = [
      ...rssArticles,
      ...hnArticles,
      ...devtoArticles,
      ...githubArticles,
    ];

    // Filter by query - check title and source
    const filtered = allArticles.filter((article) => {
      const titleMatch = article.title.toLowerCase().includes(normalizedQuery);
      const sourceMatch = article.source.toLowerCase().includes(normalizedQuery);
      return titleMatch || sourceMatch;
    });

    // Sort by relevance (title matches first, then source matches)
    const sorted = filtered.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase().includes(normalizedQuery) ? 1 : 0;
      const bExactMatch = b.title.toLowerCase().includes(normalizedQuery) ? 1 : 0;
      return bExactMatch - aExactMatch;
    });

    // Get unique sources from results
    const sourcesSet = new Set(sorted.map((a) => a.source.split("(")[0].trim()));

    return {
      articles: sorted.slice(0, limit),
      query: normalizedQuery,
      totalFound: sorted.length,
      sources: Array.from(sourcesSet),
    };
  } catch (error) {
    console.error("Search trending error:", error);
    return {
      articles: [],
      query: normalizedQuery,
      totalFound: 0,
      sources: [],
    };
  }
}

/**
 * Get search suggestions based on popular topics
 */
export function getSearchSuggestions(): string[] {
  return [
    "AI",
    "Machine Learning",
    "Web Development",
    "React",
    "TypeScript",
    "JavaScript",
    "DevOps",
    "Cloud",
    "Crypto",
    "Startup",
    "Tech News",
    "Design",
    "Product",
    "Mobile",
    "Database",
  ];
}
