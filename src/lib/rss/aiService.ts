import { callAI } from "@/lib/ai/router";
import type { GeneratedLinkedInPost, RssArticle } from "./types";

const LINKEDIN_RSS_PROMPT = `Convert this news headline into a high-performing LinkedIn post.

Title: {{title}}

Rules:
- Strong hook in first line
- Short sentences
- Professional tone
- Add curiosity
- Make it relatable
- End with a thought or takeaway
`;

const LINKEDIN_SYSTEM_PROMPT =
  "You are a concise LinkedIn ghostwriter. Turn headlines into sharp, useful, and relatable posts with a strong opening and a clear takeaway.";

function buildPrompt(title: string): string {
  return LINKEDIN_RSS_PROMPT.replace("{{title}}", title);
}

function buildFallbackPost(article: RssArticle): string {
  return [
    article.title,
    "",
    "There is a useful takeaway here for anyone building in public.",
    "",
    "The real opportunity is not just reading the news. It is turning it into action before everyone else does.",
  ].join("\n");
}

export async function generateLinkedInPostFromArticle(article: RssArticle): Promise<GeneratedLinkedInPost> {
  try {
    const post = await callAI(LINKEDIN_SYSTEM_PROMPT, buildPrompt(article.title), "free", 0.7, 220);

    return {
      post: post.trim(),
      source: article.link,
      title: article.title,
      generatedAt: new Date().toISOString(),
      fallback: false,
    };
  } catch {
    return {
      post: buildFallbackPost(article),
      source: article.link,
      title: article.title,
      generatedAt: new Date().toISOString(),
      fallback: true,
    };
  }
}

export async function generateLinkedInPostsFromArticles(articles: RssArticle[]): Promise<GeneratedLinkedInPost[]> {
  if (!articles.length) {
    return [];
  }

  const limit = Math.min(5, articles.length);
  const selectedArticles = articles.slice(0, limit);
  return Promise.all(selectedArticles.map((article) => generateLinkedInPostFromArticle(article)));
}
