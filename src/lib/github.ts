// RozgarAI — GitHub API client (public REST API, no auth needed).
// Unauthenticated rate limit: 60 requests/hour per IP. One analysis costs
// exactly 2 requests (user + repos list), so the demo survives on the free
// tier. If the user adds a GITHUB_TOKEN env var later, the limit rises.

import type { GitHubRepo, GitHubUser } from "./analyzer";

const GITHUB_API = "https://api.github.com";

export class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface RateLimitInfo {
  remaining: number | null;
  reset: number | null;
}

async function gh<T>(path: string): Promise<{
  data: T;
  rateLimit: RateLimitInfo;
}> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RozgarAI (Code for a Billion hackathon)",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  const rateLimit: RateLimitInfo = {
    remaining: res.headers.get("x-ratelimit-remaining")
      ? Number(res.headers.get("x-ratelimit-remaining"))
      : null,
    reset: res.headers.get("x-ratelimit-reset")
      ? Number(res.headers.get("x-ratelimit-reset"))
      : null,
  };

  if (res.status === 404) {
    throw new GitHubError(404, "GitHub user not found");
  }
  if (res.status === 403) {
    throw new GitHubError(
      403,
      "GitHub API rate limit reached (60 requests/hour without a token). Try again later.",
    );
  }
  if (!res.ok) {
    throw new GitHubError(res.status, `GitHub API error: ${res.status}`);
  }
  return { data: (await res.json()) as T, rateLimit };
}

export async function fetchGitHubUser(username: string) {
  return gh<GitHubUser>(
    `/users/${encodeURIComponent(username)}`,
  );
}

export async function fetchGitHubRepos(username: string) {
  return gh<GitHubRepo[]>(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
  );
}
