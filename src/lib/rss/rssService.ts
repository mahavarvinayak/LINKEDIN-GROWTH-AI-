import Parser from "rss-parser";
import type { RssArticle, RssFeedConfig } from "./types";

const parser = new Parser();
const DEFAULT_ARTICLES_PER_FEED = 10;

const DEFAULT_FEEDS: RssFeedConfig[] = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
  { name: "Hacker News", url: "https://news.ycombinator.com/rss" },
  { name: "a16z", url: "https://a16z.com/feed/" },
];

function normalizeFeedEntry(entry: string): string | null {
  const trimmed = entry.trim();
  return trimmed.length ? trimmed : null;
}

export function getConfiguredFeeds(): RssFeedConfig[] {
  const jsonConfig = process.env.RSS_FEEDS_JSON;
  if (jsonConfig) {
    try {
      const parsed = JSON.parse(jsonConfig) as Array<Partial<RssFeedConfig>>;
      const sanitized = parsed
        .map((feed, index) => ({
          name: feed.name?.trim() || `Feed ${index + 1}`,
          url: feed.url?.trim() || "",
        }))
        .filter((feed) => feed.url.length > 0);

      if (sanitized.length > 0) {
        return sanitized;
      }
    } catch {
      // Ignore malformed JSON and fall back to URL list/defaults.
    }
  }

  const urlList = process.env.RSS_FEED_URLS;
  if (urlList) {
    const feeds = urlList
      .split(",")
      .map(normalizeFeedEntry)
      .filter((url): url is string => Boolean(url))
      .map((url, index) => ({
        name: `Feed ${index + 1}`,
        url,
      }));

    if (feeds.length > 0) {
      return feeds;
    }
  }

  return DEFAULT_FEEDS;
}

function toIsoDate(value: unknown): string {
  const parsed = value ? new Date(String(value)) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function sanitizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeArticles(articles: RssArticle[]): RssArticle[] {
  const seen = new Set<string>();
  const deduped: RssArticle[] = [];

  for (const article of articles) {
    const key = article.title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(article);
  }

  return deduped;
}

async function fetchFeed(feed: RssFeedConfig): Promise<RssArticle[]> {
  const parsed = await parser.parseURL(feed.url);
  return (parsed.items ?? [])
    .slice(0, DEFAULT_ARTICLES_PER_FEED)
    .map((item) => ({
      title: sanitizeText(item.title),
      link: sanitizeText(item.link) || feed.url,
      date: toIsoDate(item.isoDate ?? item.pubDate),
      description: sanitizeText(item.contentSnippet || item.content || "").substring(0, 150),
      source: feed.name,
    }))
    .filter((item) => item.title.length > 0 && item.description.length > 10); // Only items with real descriptions
}

export async function fetchLatestRssArticles(): Promise<RssArticle[]> {
  const feeds = getConfiguredFeeds();

  const settled = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed)));

  const articles = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

  return dedupeArticles(articles).sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime();
  });
}
