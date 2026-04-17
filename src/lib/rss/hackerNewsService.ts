import type { RssArticle } from "./types";

const HACKER_NEWS_API_BASE = "https://hacker-news.firebaseio.com/v0";

export interface HNStory {
  id: number;
  type: string;
  title: string;
  url?: string;
  by: string;
  score: number;
  time: number;
  descendants?: number;
  text?: string;
}

function normalizeDescription(text?: string): string {
  const cleaned = (text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "";
  }

  if (cleaned.length <= 700) {
    return cleaned;
  }

  const snippet = cleaned.slice(0, 700);
  const boundary = Math.max(snippet.lastIndexOf("."), snippet.lastIndexOf("!"), snippet.lastIndexOf("?"));
  if (boundary > 300) {
    return snippet.slice(0, boundary + 1).trim();
  }

  const lastSpace = snippet.lastIndexOf(" ");
  if (lastSpace > 300) {
    return `${snippet.slice(0, lastSpace).trim()}...`;
  }

  return `${snippet.trim()}...`;
}

/**
 * Fetch top stories from Hacker News Firebase API
 * No API key required, completely free!
 */
export async function fetchHackerNewsStories(limit: number = 15): Promise<RssArticle[]> {
  try {
    // Step 1: Get top story IDs
    const topStoriesRes = await fetch(`${HACKER_NEWS_API_BASE}/topstories.json`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!topStoriesRes.ok) {
      console.error("Failed to fetch Hacker News story IDs");
      return [];
    }

    const storyIds: number[] = await topStoriesRes.json();

    // Step 2: Fetch details for top N stories
    const articles: RssArticle[] = [];
    const limitedIds = storyIds.slice(0, limit);

    for (const storyId of limitedIds) {
      try {
        const storyRes = await fetch(`${HACKER_NEWS_API_BASE}/item/${storyId}.json`, {
          next: { revalidate: 1800 }, // Cache for 30 minutes
        });

        if (!storyRes.ok) continue;

        const story: HNStory = await storyRes.json();

        // Only include valid stories with URLs and EXCLUDE Ask HN, Show HN, Launch HN
        if (!story.title) continue;
        if (story.title.match(/^(Ask HN:|Show HN:|Launch HN:|Tell HN:)/i)) continue; // Skip non-news posts
        if (!story.url) continue; // Only include stories with URLs (real external content)
        if (story.score < 20) continue; // Only include posts with some engagement

        const description = normalizeDescription(story.text) || "Trending on Hacker News";

        articles.push({
          title: story.title,
          link: story.url,
          date: new Date(story.time * 1000).toISOString(),
          description,
          source: `Hacker News (${story.score} pts)`,
        });
      } catch (error) {
        console.warn(`Failed to fetch HN story ${storyId}:`, error);
        continue;
      }
    }

    return articles;
  } catch (error) {
    console.error("Error fetching Hacker News stories:", error);
    return [];
  }
}

/**
 * Fetch best stories from Hacker News (highest quality)
 */
export async function fetchHackerNewsBestStories(limit: number = 10): Promise<RssArticle[]> {
  try {
    const bestStoriesRes = await fetch(`${HACKER_NEWS_API_BASE}/beststories.json`, {
      next: { revalidate: 3600 },
    });

    if (!bestStoriesRes.ok) {
      return [];
    }

    const storyIds: number[] = await bestStoriesRes.json();
    const articles: RssArticle[] = [];
    const limitedIds = storyIds.slice(0, limit);

    for (const storyId of limitedIds) {
      try {
        const storyRes = await fetch(`${HACKER_NEWS_API_BASE}/item/${storyId}.json`, {
          next: { revalidate: 1800 },
        });

        if (!storyRes.ok) continue;

        const story: HNStory = await storyRes.json();

        // Best stories - still filter out non-news
        if (!story.title) continue;
        if (story.title.match(/^(Ask HN:|Show HN:|Launch HN:|Tell HN:)/i)) continue;
        if (!story.url) continue; // Only external content

        const description = normalizeDescription(story.text) || "Top story on Hacker News";

        articles.push({
          title: story.title,
          link: story.url,
          date: new Date(story.time * 1000).toISOString(),
          description,
          source: `HN Best (${story.score} pts)`,
        });
      } catch (error) {
        console.warn(`Failed to fetch HN best story ${storyId}:`, error);
        continue;
      }
    }

    return articles;
  } catch (error) {
    console.error("Error fetching Hacker News best stories:", error);
    return [];
  }
}
