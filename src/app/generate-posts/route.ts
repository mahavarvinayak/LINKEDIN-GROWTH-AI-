import { NextResponse } from "next/server";
import { getRssSystemSnapshot, startRssScheduler, refreshRssSystem } from "@/lib/rss/scheduler";
import { pickRandomGeneratedPosts } from "@/lib/rss/cacheService";
import type { GeneratedLinkedInPost } from "@/lib/rss/types";

export const runtime = "nodejs";

export async function GET() {
  startRssScheduler();

  const snapshot = getRssSystemSnapshot();
  const cachedGeneratedPosts = pickRandomGeneratedPosts(5);

  if (cachedGeneratedPosts.length > 0) {
    return NextResponse.json({
      success: true,
      source: "generated-cache",
      count: cachedGeneratedPosts.length,
      posts: cachedGeneratedPosts,
      meta: {
        cachedFeeds: snapshot.cachedFeeds.length,
        lastFetchedAt: snapshot.lastFetchedAt,
        lastGeneratedAt: snapshot.lastGeneratedAt,
        refreshing: snapshot.refreshing,
        lastError: snapshot.lastError,
      },
    });
  }

  if (snapshot.cachedFeeds.length > 0) {
    const fallbackPosts: GeneratedLinkedInPost[] = snapshot.cachedFeeds.slice(0, 5).map((article) => ({
      post: [
        article.title,
        "",
        article.description || "This trend is getting attention in the tech ecosystem.",
        "",
        "My take: this is worth watching if you are building right now.",
      ].join("\n"),
      source: article.source,
      title: article.title,
      description: article.description,
      generatedAt: new Date().toISOString(),
      fallback: true,
    }));

    return NextResponse.json({
      success: true,
      source: "raw-headlines-fallback",
      count: fallbackPosts.length,
      posts: fallbackPosts,
      meta: {
        cachedFeeds: snapshot.cachedFeeds.length,
        lastFetchedAt: snapshot.lastFetchedAt,
        lastGeneratedAt: snapshot.lastGeneratedAt,
        refreshing: snapshot.refreshing,
        lastError: snapshot.lastError,
      },
    });
  }

  void refreshRssSystem();

  return NextResponse.json(
    {
      success: false,
      source: "warming",
      count: 0,
      posts: [],
      meta: {
        cachedFeeds: snapshot.cachedFeeds.length,
        lastFetchedAt: snapshot.lastFetchedAt,
        lastGeneratedAt: snapshot.lastGeneratedAt,
        refreshing: true,
        lastError: snapshot.lastError,
      },
      message: "RSS cache is warming in the background. Try again in a moment.",
    },
    { status: 202 }
  );
}
