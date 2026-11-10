import { NextResponse } from "next/server";
import { analyzeProfile } from "@/lib/analyzer";
import { fetchGitHubRepos, fetchGitHubUser, GitHubError } from "@/lib/github";

const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();

  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Provide a valid GitHub username (letters, numbers, hyphens)." },
      { status: 400 },
    );
  }

  try {
    const [{ data: user, rateLimit }, { data: repos }] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
    ]);

    const analysis = analyzeProfile(user, repos);
    return NextResponse.json({ analysis, rateLimit });
  } catch (err) {
    if (err instanceof GitHubError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("analyze failed", err);
    return NextResponse.json(
      { error: "Could not reach GitHub. Check your connection and try again." },
      { status: 502 },
    );
  }
}
