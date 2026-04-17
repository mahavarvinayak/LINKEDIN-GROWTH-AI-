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

        // Only include valid stories with URLs or text
        if (!story.title) continue;

        articles.push({
          title: story.title,
          link: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          date: new Date(story.time * 1000).toISOString(),
          description: story.text ? story.text.substring(0, 150) : story.title,
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

        if (!story.title) continue;

        articles.push({
          title: story.title,
          link: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          date: new Date(story.time * 1000).toISOString(),
          description: story.text ? story.text.substring(0, 150) : story.title,
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
