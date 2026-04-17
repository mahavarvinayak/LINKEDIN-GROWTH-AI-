import { fetchLatestRssArticles } from "./rssService";
import {
  getRssCacheSnapshot,
  pickRandomArticles,
  setCachedFeeds,
  setGeneratedPostsCache,
  setLastError,
  setRefreshing,
} from "./cacheService";
import { generateLinkedInPostsFromArticles } from "./aiService";

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

async function rebuildCaches(): Promise<void> {
  setRefreshing(true);

  try {
    const articles = await fetchLatestRssArticles();

    if (articles.length > 0) {
      setCachedFeeds(articles);
    }

    const sourceArticles = articles.length > 0 ? articles : getRssCacheSnapshot().cachedFeeds;
    const selectedArticles = pickRandomArticles(Math.min(5, sourceArticles.length));

    if (selectedArticles.length > 0) {
      const generatedPosts = await generateLinkedInPostsFromArticles(selectedArticles);
      if (generatedPosts.length > 0) {
        setGeneratedPostsCache(generatedPosts);
      }
    }

    setLastError(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "RSS refresh failed";
    setLastError(message);
  } finally {
    setRefreshing(false);
  }
}

export async function refreshRssSystem(): Promise<void> {
  await rebuildCaches();
}

export function startRssScheduler(): void {
  if (globalThis.__rssSchedulerId) {
    return;
  }

  globalThis.__rssSchedulerId = setInterval(() => {
    void rebuildCaches();
  }, REFRESH_INTERVAL_MS);

  globalThis.__rssSchedulerId.unref?.();

  if (getRssCacheSnapshot().cachedFeeds.length === 0) {
    void rebuildCaches();
  }
}

export function getRssSystemSnapshot() {
  return getRssCacheSnapshot();
}
