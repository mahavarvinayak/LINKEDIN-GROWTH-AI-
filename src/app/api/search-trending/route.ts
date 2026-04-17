import { NextRequest, NextResponse } from "next/server";
import { searchTrendingArticles } from "@/lib/rss/searchService";

// Mark this route as dynamic (uses query parameters)
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const results = await searchTrendingArticles(query, Math.min(limit, 20));

    return NextResponse.json({
      success: true,
      ...results,
      posts: results.articles.map((article) => ({
        post: article.title,
        source: article.source,
        title: article.title,
        link: article.link,
        date: article.date,
        suggested_hashtags: extractHashtags(article.title),
      })),
    });
  } catch (error) {
    console.error("Search trending error:", error);
    return NextResponse.json(
      { error: "Failed to search trending posts" },
      { status: 500 }
    );
  }
}

function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#\w+/g) || [];
  // Also extract potential keywords as hashtags
  const keywords = text
    .toLowerCase()
    .split(/[\s\-.,;:!?()]+/)
    .filter((word) => word.length > 3 && word.length < 15)
    .slice(0, 3);

  return [...new Set([...hashtags, ...keywords])].slice(0, 5);
}
