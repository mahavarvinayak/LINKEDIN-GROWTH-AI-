import type { GeneratedLinkedInPost, RssArticle, RssCacheSnapshot } from "./types";

const DEFAULT_STATE: RssCacheSnapshot = {
  cachedFeeds: [],
  generatedPostsCache: [],
  lastFetchedAt: null,
  lastGeneratedAt: null,
  refreshing: false,
  lastError: null,
};

declare global {
  // Shared in-memory cache for the running Node.js process.
  // This is intentionally not persisted to a database.
  // eslint-disable-next-line no-var
  var __rssCacheState: RssCacheSnapshot | undefined;
  // eslint-disable-next-line no-var
  var __rssSchedulerId: NodeJS.Timeout | undefined;
}

export function getRssCacheState(): RssCacheSnapshot {
  if (!globalThis.__rssCacheState) {
    globalThis.__rssCacheState = { ...DEFAULT_STATE };
  }

  return globalThis.__rssCacheState;
}

export function getRssCacheSnapshot(): RssCacheSnapshot {
  return getRssCacheState();
}

export function setCachedFeeds(cachedFeeds: RssArticle[]): void {
  const state = getRssCacheState();
  state.cachedFeeds = cachedFeeds;
  state.lastFetchedAt = new Date().toISOString();
}

export function setGeneratedPostsCache(generatedPostsCache: GeneratedLinkedInPost[]): void {
  const state = getRssCacheState();
  state.generatedPostsCache = generatedPostsCache;
  state.lastGeneratedAt = new Date().toISOString();
}

export function setRefreshing(refreshing: boolean): void {
  getRssCacheState().refreshing = refreshing;
}

export function setLastError(lastError: string | null): void {
  getRssCacheState().lastError = lastError;
}

export function pickRandomArticles(count: number): RssArticle[] {
  const articles = [...getRssCacheState().cachedFeeds];
  if (!articles.length) {
    return [];
  }

  for (let index = articles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [articles[index], articles[swapIndex]] = [articles[swapIndex], articles[index]];
  }

  return articles.slice(0, Math.max(0, count));
}

export function pickRandomGeneratedPosts(count: number): GeneratedLinkedInPost[] {
  const posts = [...getRssCacheState().generatedPostsCache];
  if (!posts.length) {
    return [];
  }

  for (let index = posts.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [posts[index], posts[swapIndex]] = [posts[swapIndex], posts[index]];
  }

  const maxCount = Math.min(posts.length, Math.max(3, Math.min(5, count)));
  return posts.slice(0, maxCount);
}
