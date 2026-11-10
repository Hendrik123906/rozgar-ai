// Shared fetch + analyze step for API routes that work from a username.
// Validates the username, pulls the public GitHub user + repos (2 requests),
// and returns the Analyzer result with the rate-limit info.

import { analyzeProfile, type Analysis } from "./analyzer";
import {
  fetchGitHubRepos,
  fetchGitHubUser,
  type RateLimitInfo,
} from "./github";

const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export function validUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}

export async function getAnalysis(username: string): Promise<{
  analysis: Analysis;
  rateLimit: RateLimitInfo;
}> {
  const [{ data: user, rateLimit }, { data: repos }] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username),
  ]);
  return { analysis: analyzeProfile(user, repos), rateLimit };
}
