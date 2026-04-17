import { NextResponse } from "next/server";
import { refreshRssSystem, getRssSystemSnapshot, startRssScheduler } from "@/lib/rss/scheduler";

export const runtime = "nodejs";

export async function GET() {
  startRssScheduler();
  await refreshRssSystem();

  const snapshot = getRssSystemSnapshot();

  return NextResponse.json({
    success: true,
    cachedFeeds: snapshot.cachedFeeds.length,
    cachedPosts: snapshot.generatedPostsCache.length,
    lastFetchedAt: snapshot.lastFetchedAt,
    lastGeneratedAt: snapshot.lastGeneratedAt,
    lastError: snapshot.lastError,
  });
}