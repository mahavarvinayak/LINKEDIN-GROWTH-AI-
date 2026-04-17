import { NextRequest, NextResponse } from "next/server";
import { refreshRssSystem, getRssSystemSnapshot, startRssScheduler } from "@/lib/rss/scheduler";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    startRssScheduler();

    // Check if user wants to force refresh
    const body = await req.json().catch(() => ({}));
    const forceRefresh = body.forceRefresh === true;

    // If force refresh requested, refresh the system
    if (forceRefresh) {
      await refreshRssSystem();
    }

    // Get cached posts
    const snapshot = getRssSystemSnapshot();
    const posts = snapshot.generatedPostsCache;

    if (posts.length === 0) {
      // If no posts cached, try refreshing
      await refreshRssSystem();
      const newSnapshot = getRssSystemSnapshot();
      return NextResponse.json({
        success: true,
        posts: newSnapshot.generatedPostsCache.map((post) => ({
          post: post.post,
          source: post.source,
          title: post.title,
          suggested_hashtags: extractHashtags(post.post),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      posts: posts.map((post) => ({
        post: post.post,
        source: post.source,
        title: post.title,
        suggested_hashtags: extractHashtags(post.post),
      })),
    });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending posts" },
      { status: 500 }
    );
  }
}

// Fallback GET method for simple refresh
export async function GET(req: NextRequest) {
  try {
    startRssScheduler();

    const snapshot = getRssSystemSnapshot();
    const posts = snapshot.generatedPostsCache;

    if (posts.length === 0) {
      await refreshRssSystem();
      const newSnapshot = getRssSystemSnapshot();
      return NextResponse.json({
        success: true,
        posts: newSnapshot.generatedPostsCache.map((post) => ({
          post: post.post,
          source: post.source,
          title: post.title,
          suggested_hashtags: extractHashtags(post.post),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      posts: posts.map((post) => ({
        post: post.post,
        source: post.source,
        title: post.title,
        suggested_hashtags: extractHashtags(post.post),
      })),
    });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending posts" },
      { status: 500 }
    );
  }
}

function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#\w+/g) || [];
  return [...new Set(hashtags)].slice(0, 5);
}
