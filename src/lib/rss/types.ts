export interface RssFeedConfig {
  name: string;
  url: string;
}

export interface RssArticle {
  title: string;
  link: string;
  date: string;
  source: string;
}

export interface GeneratedLinkedInPost {
  post: string;
  source: string;
  title: string;
  generatedAt: string;
  fallback: boolean;
}

export interface RssCacheSnapshot {
  cachedFeeds: RssArticle[];
  generatedPostsCache: GeneratedLinkedInPost[];
  lastFetchedAt: string | null;
  lastGeneratedAt: string | null;
  refreshing: boolean;
  lastError: string | null;
}
