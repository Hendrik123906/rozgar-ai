import { NextResponse } from "next/server";
import { getAnalysis, validUsername } from "@/lib/analyze-user";
import { GitHubError } from "@/lib/github";
import { JOBS, matchJobs } from "@/lib/matcher";
import { buildSkillGapPlan } from "@/lib/skillgap";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();

  if (!username || !validUsername(username)) {
    return NextResponse.json(
      { error: "Provide a valid GitHub username (letters, numbers, hyphens)." },
      { status: 400 },
    );
  }

  try {
    const { analysis, rateLimit } = await getAnalysis(username);
    const matches = matchJobs(analysis, JOBS, 5);
    const plan = buildSkillGapPlan(analysis, matches);
    return NextResponse.json({
      analysis,
      matches,
      plan,
      jobsConsidered: JOBS.length,
      rateLimit,
    });
  } catch (err) {
    if (err instanceof GitHubError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("skillgap failed", err);
    return NextResponse.json(
      { error: "Could not reach GitHub. Check your connection and try again." },
      { status: 502 },
    );
  }
}
