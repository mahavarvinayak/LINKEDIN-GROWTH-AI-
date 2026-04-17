import type { RssArticle } from "./types";

const GITHUB_TRENDING_URL = "https://github.com/trending";

export interface GithubTrendingRepo {
  name: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  starsThisWeek: number;
}

/**
 * Fetch trending repositories from GitHub
 * Uses web scraping (no API key needed!)
 * Parses HTML to extract trending repos
 */
export async function fetchGithubTrending(
  language: string = "",
  limit: number = 15
): Promise<RssArticle[]> {
  try {
    // Build URL with optional language filter
    const url = language ? `${GITHUB_TRENDING_URL}?spoken_language_code=&since=daily&spoken_language_code=&d=${language}` : GITHUB_TRENDING_URL;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`GitHub trending fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();

    // Parse HTML to extract repositories
    const repos = parseGithubTrendingHTML(html);

    // Convert to RssArticle format
    return repos.slice(0, limit).map((repo) => ({
      title: `${repo.name} - ${repo.description}`,
      link: `https://github.com${repo.url}`,
      date: new Date().toISOString(),
      source: `GitHub Trending (${repo.starsThisWeek} stars this week)`,
    }));
  } catch (error) {
    console.error("Error fetching GitHub trending:", error);
    return [];
  }
}

/**
 * Parse HTML from GitHub trending page
 * Extracts repository information
 */
function parseGithubTrendingHTML(html: string): GithubTrendingRepo[] {
  const repos: GithubTrendingRepo[] = [];

  // Regex patterns for parsing
  const repoPattern = /<article[\s\S]*?<\/article>/g;
  const namePattern = /href="([^"]+)"\s*class="Box-row-link"/;
  const descPattern = /class="col-9 text-gray-secondary">([\s\S]*?)<\/p>/;
  const langPattern = /itemprop="programmingLanguage">([^<]+)</;
  const starsPattern = /class="d-inline-block float-sm-right">([\s\S]*?)<\/span>/;

  const matches = html.match(repoPattern);

  if (!matches) {
    return [];
  }

  for (const article of matches.slice(0, 30)) {
    try {
      // Extract repo name/url
      const nameMatch = article.match(namePattern);
      if (!nameMatch) continue;

      const repoUrl = nameMatch[1];
      const name = repoUrl.split("/").filter(Boolean).join("/");

      // Extract description
      const descMatch = article.match(descPattern);
      const description = descMatch ? descMatch[1].trim().substring(0, 100) : "No description";

      // Extract language
      const langMatch = article.match(langPattern);
      const language = langMatch ? langMatch[1].trim() : "Unknown";

      // Extract stars this week
      const starsMatch = article.match(starsPattern);
      let starsThisWeek = 0;
      if (starsMatch) {
        const starsText = starsMatch[1];
        const match = starsText.match(/(\d+)/);
        if (match) {
          starsThisWeek = parseInt(match[1], 10);
        }
      }

      repos.push({
        name,
        url: repoUrl,
        description,
        language,
        stars: 0, // GitHub trending page doesn't show total stars
        starsThisWeek,
      });
    } catch (error) {
      console.warn("Error parsing GitHub repo:", error);
      continue;
    }
  }

  return repos;
}

/**
 * Alternative: Fetch using GitHub REST API with search query
 * Still free but has rate limits (no auth: 60 req/hour, with auth: 5000 req/hour)
 */
export async function fetchGithubTrendingViaAPI(
  limit: number = 15,
  query?: string
): Promise<RssArticle[]> {
  try {
    // If query provided, search for that specific topic
    // Otherwise search for popular recent repos
    let searchQuery = query 
      ? `${query} stars:>100 sort:stars`
      : "created:>2024-01-01&sort=stars";

    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&order=desc&per_page=${limit}`,
      {
        headers: {
          "Accept": "application/vnd.github+json",
          "User-Agent": "LinkedIn-Growth-AI",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();

    return (data.items || []).map((repo: any) => ({
      title: repo.full_name,
      link: repo.html_url,
      date: repo.updated_at,
      description: repo.description || `${repo.stargazers_count} stars`,
      source: `GitHub (${repo.stargazers_count} ⭐)`,
    }));
  } catch (error) {
    console.error("Error fetching GitHub API:", error);
    return [];
  }
}
