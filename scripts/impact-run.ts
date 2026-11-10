// RozgarAI — Impact Run (Phase 4, Code for a Billion)
// Runs the real Analyzer + Job Matcher + Skill-Gap Plan over ~50 REAL
// Indian beginner GitHub profiles found via the public GitHub Search API.
// Writes one row per profile to impact-results.json (incremental, resumable).
// Respects the unauthenticated GitHub rate limit (60 core req/hour):
// each profile costs exactly 2 core requests; the script sleeps until the
// limit resets instead of failing. Search calls use the separate search
// quota (10/min). Run with: node /tmp/rozgar-run/scripts/impact-run.js
// from the repo root (uses process.cwd() for the output file).

import * as fs from "fs";
import * as path from "path";
import {
  fetchGitHubRepos,
  fetchGitHubUser,
  GitHubError,
} from "../src/lib/github";
import { analyzeProfile } from "../src/lib/analyzer";
import { JOBS, matchJobs } from "../src/lib/matcher";
import { buildSkillGapPlan } from "../src/lib/skillgap";

const RESULTS_PATH = path.join(process.cwd(), "impact-results.json");
const TARGET = 50;
const SLEEP_BETWEEN_MS = 1200;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface ImpactRow {
  username: string;
  name: string | null;
  location: string | null;
  followers: number;
  publicRepos: number;
  accountAgeDays: number;
  score: number;
  band: string;
  components: { profile: number; activity: number; quality: number; languages: number };
  topLanguage: string | null;
  gaps: string[];
  topMatch: { role: string; company: string; score: number } | null;
  usableMatch: boolean; // top match score >= 50
  planFocus: string[];
  planTarget: string;
}

async function getCoreResetMs(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/rate_limit", {
      headers: { "User-Agent": "RozgarAI (Code for a Billion hackathon)" },
    });
    const json = await res.json();
    return json?.resources?.core?.reset
      ? json.resources.core.reset * 1000
      : null;
  } catch {
    return null;
  }
}

async function searchCandidates(): Promise<string[]> {
  const logins: string[] = [];
  const q = encodeURIComponent(
    "location:India followers:0..20 repos:1..15 created:>2023-01-01",
  );
  for (const page of [1, 2]) {
    const res = await fetch(
      `https://api.github.com/search/users?q=${q}&sort=followers&order=asc&per_page=30&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "RozgarAI (Code for a Billion hackathon)",
        },
      },
    );
    if (!res.ok) {
      console.log(`search page ${page} failed: HTTP ${res.status}`);
      continue;
    }
    const json = await res.json();
    const items = (json.items ?? []) as { login: string; type: string }[];
    for (const item of items) {
      if (item.type === "User") logins.push(item.login);
    }
    console.log(
      `search page ${page}: ${items.length} users (total_count ${json.total_count})`,
    );
    await sleep(1000);
  }
  return [...new Set(logins)];
}

async function main() {
  const done: ImpactRow[] = fs.existsSync(RESULTS_PATH)
    ? (JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8")) as ImpactRow[])
    : [];
  const doneSet = new Set(done.map((r) => r.username.toLowerCase()));
  console.log(`resuming with ${done.length} profiles already done`);

  let candidates = (await searchCandidates()).filter(
    (l) => !doneSet.has(l.toLowerCase()),
  );
  console.log(`${candidates.length} new candidates`);

  let idx = 0;
  let retries = 0;
  while (done.length < TARGET && idx < candidates.length) {
    const login = candidates[idx];
    try {
      const [{ data: user, rateLimit }, { data: repos }] = await Promise.all([
        fetchGitHubUser(login),
        fetchGitHubRepos(login),
      ]);
      const analysis = analyzeProfile(user, repos);
      const matches = matchJobs(analysis, JOBS, 5);
      const plan = matches.length > 0 ? buildSkillGapPlan(analysis, matches) : null;
      const top = matches[0] ?? null;
      const row: ImpactRow = {
        username: analysis.username,
        name: analysis.name,
        location: analysis.location,
        followers: analysis.followers,
        publicRepos: analysis.publicRepos,
        accountAgeDays: analysis.accountAgeDays,
        score: analysis.score.total,
        band: analysis.score.band,
        components: {
          profile: analysis.score.components[0].score,
          activity: analysis.score.components[1].score,
          quality: analysis.score.components[2].score,
          languages: analysis.score.components[3].score,
        },
        topLanguage: analysis.languages[0]?.language ?? null,
        gaps: analysis.gaps.slice(0, 3),
        topMatch: top
          ? { role: top.job.role, company: top.job.company, score: top.score }
          : null,
        usableMatch: (top?.score ?? 0) >= 50,
        planFocus: plan?.focusSkills ?? [],
        planTarget: plan ? `${plan.targetRole} at ${plan.targetCompany}` : "",
      };
      done.push(row);
      fs.writeFileSync(RESULTS_PATH, JSON.stringify(done, null, 2));
      console.log(
        `[${done.length}/${TARGET}] ${login}: ${row.score}/100 ${row.band} | top match ${row.topMatch ? `${row.topMatch.role} @ ${row.topMatch.company} ${row.topMatch.score}%` : "none"} | rate remaining ${rateLimit.remaining}`,
      );
      idx += 1;
      retries = 0;

      if (
        rateLimit.remaining !== null &&
        rateLimit.remaining <= 4 &&
        done.length < TARGET
      ) {
        const resetMs = rateLimit.reset ? rateLimit.reset * 1000 : await getCoreResetMs();
        const waitMs = resetMs ? resetMs - Date.now() + 15000 : 30 * 60 * 1000;
        if (waitMs > 0) {
          console.log(
            `rate limit low (${rateLimit.remaining} left), sleeping ${Math.round(waitMs / 1000)}s until reset`,
          );
          await sleep(waitMs);
        }
      } else {
        await sleep(SLEEP_BETWEEN_MS);
      }
    } catch (e) {
      if (e instanceof GitHubError && e.status === 404) {
        console.log(`skip ${login}: user not found (404)`);
        idx += 1;
        continue;
      }
      if (e instanceof GitHubError && e.status === 403 && retries < 2) {
        retries += 1;
        const resetMs = await getCoreResetMs();
        const waitMs = resetMs ? resetMs - Date.now() + 15000 : 15 * 60 * 1000;
        console.log(
          `403 for ${login} (rate limit?), retry ${retries}/2 after ${Math.round(waitMs / 1000)}s`,
        );
        await sleep(Math.max(waitMs, 1000));
        continue; // retry same login (idx not advanced)
      }
      console.log(`error ${login}: ${e instanceof Error ? e.message : e}`);
      idx += 1;
    }
  }

  if (done.length >= TARGET) {
    console.log(`DONE: ${done.length} profiles analyzed`);
  } else {
    console.log(
      `STOPPED: ${done.length}/${TARGET} profiles — ran out of candidates (${candidates.length} total). Re-run to search more pages.`,
    );
  }
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
