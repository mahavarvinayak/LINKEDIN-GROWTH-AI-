import type { RssArticle } from "../rss/types";

const CURRENTS_API_BASE = "https://api.currentsapi.services/v1";
const CURRENTS_API_KEY = process.env.CURRENTS_API_KEY?.trim() || "";

interface CurrentsArticle {
  id: string;
  title: string;
  description?: string;
  url?: string;
  author?: string | null;
  image?: string | null;
  language?: string;
  category?: string[];
  published?: string;
}

interface CurrentsResponse {
  status?: string;
  news?: CurrentsArticle[];
}

function sanitizeText(text: string | undefined | null): string {
  if (!text) {
    return "";
  }

  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSourceLabel(article: CurrentsArticle): string {
  const rawUrl = sanitizeText(article.url);

  if (!rawUrl) {
    return "Currents News";
  }

  try {
    const hostname = new URL(rawUrl).hostname.replace(/^www\./i, "");
    return `Currents (${hostname})`;
  } catch {
    return "Currents News";
  }
}

function toRssArticle(article: CurrentsArticle): RssArticle | null {
  const title = sanitizeText(article.title);
  const description = sanitizeText(article.description);
  const link = sanitizeText(article.url);

  if (!title || !link) {
    return null;
  }

  return {
    title,
    description: description || title,
    link,
    date: article.published ? new Date(article.published).toISOString() : new Date().toISOString(),
    source: getSourceLabel(article),
  };
}

async function fetchCurrents(pathWithQuery: string, revalidateSeconds: number): Promise<RssArticle[]> {
  if (!CURRENTS_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${CURRENTS_API_BASE}${pathWithQuery}`, {
      headers: {
        Authorization: CURRENTS_API_KEY,
      },
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) {
      console.warn(`Currents API error (${response.status}) for ${pathWithQuery}`);
      return [];
    }

    const payload: CurrentsResponse = await response.json();
    const items = payload.news || [];

    return items
      .map(toRssArticle)
      .filter((article): article is RssArticle => Boolean(article));
  } catch (error) {
    console.warn("Currents API request failed:", error);
    return [];
  }
}

export async function fetchCurrentsLatestNews(limit: number = 20, language: string = "en"): Promise<RssArticle[]> {
  const pageSize = Math.max(1, Math.min(limit, 50));
  return fetchCurrents(`/latest-news?language=${encodeURIComponent(language)}&page_size=${pageSize}`, 900);
}

export async function fetchCurrentsNewsByKeyword(query: string, limit: number = 20, language: string = "en"): Promise<RssArticle[]> {
  const normalizedQuery = sanitizeText(query);
  if (!normalizedQuery) {
    return [];
  }

  const pageSize = Math.max(1, Math.min(limit, 50));
  const encodedQuery = encodeURIComponent(normalizedQuery);
  return fetchCurrents(`/search?keywords=${encodedQuery}&language=${encodeURIComponent(language)}&page_size=${pageSize}`, 600);
}
