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
        post: composeTrendingPost(article.title, article.description, article.source),
        description: cleanDescription(article.description) || article.title,
        source: article.source,
        title: article.title,
        link: article.link,
        date: article.date,
        suggested_hashtags: extractHashtags(`${article.title} ${article.description || ""}`),
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

function cleanDescription(text?: string): string {
  if (!text) {
    return "";
  }

  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function composeTrendingPost(title: string, description: string | undefined, source: string): string {
  const summary = cleanDescription(description);
  const sourceName = source.split("(")[0].trim();

  return [
    title,
    "",
    summary || `This is trending right now in ${sourceName}.`,
    "",
    "My take: this is a signal worth watching if you are building in tech.",
    "",
    "Do you think this trend will grow in the next 12 months?",
  ].join("\n");
}

function extractHashtags(text: string): string[] {
  const stopWords = new Set([
    "that",
    "this",
    "with",
    "from",
    "have",
    "will",
    "into",
    "their",
    "about",
    "after",
    "before",
    "there",
    "these",
    "those",
    "where",
    "which",
    "https",
    "www",
  ]);

  const explicitHashtags = (text.match(/#[a-z0-9_]+/gi) || []).map((tag) => tag.replace(/^#/, "").toLowerCase());
  const keywords = text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && word.length <= 20)
    .filter((word) => !stopWords.has(word))
    .filter((word) => !/^\d+$/.test(word));

  return Array.from(new Set([...explicitHashtags, ...keywords])).slice(0, 5);
}
