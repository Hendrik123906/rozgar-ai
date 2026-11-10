// RozgarAI — Job Matcher Agent
// Matches a GitHub Analyzer result against the entry-level India tech job
// seed dataset (src/data/jobs-seed.json). Deterministic and explainable:
// every match lists exactly which required skills the user has, which are
// related, and which are missing. No external API calls — pure computation.

import type { Analysis } from "./analyzer";
import jobsData from "@/data/jobs-seed.json";

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  experience: string;
  type: string;
  skills: string[];
  source: string;
}

export interface JobMatch {
  job: Job;
  /** 0..100 — share of the job's required skills the user covers. */
  score: number;
  matched: string[]; // exact skill the user has
  related: string[]; // close ecosystem skill (worth half credit)
  missing: string[]; // required skills the user has no evidence for
  reason: string;
}

export const JOBS: Job[] = jobsData as Job[];

/** Skills that count as evidence for a required skill, at half credit.
 * A JavaScript/TypeScript coder can reasonably pick up the JS web stack;
 * a C coder can pick up C++ basics. Everything else needs an exact match. */
const ECOSYSTEM: Record<string, string[]> = {
  javascript: ["react", "node.js", "next.js", "tailwind css", "html", "css"],
  typescript: ["react", "node.js", "next.js", "tailwind css", "html", "css"],
  c: ["c++"],
  "c++": ["c"],
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** User skills = languages from the Analyzer, weighted by repo share.
 * Returns a map of normalized skill -> weight (0..1). */
export function userSkills(analysis: Analysis): Map<string, number> {
  const skills = new Map<string, number>();
  for (const l of analysis.languages) {
    const key = norm(l.language);
    // Weight by share so a dominant language counts more than a one-off.
    skills.set(key, Math.max(skills.get(key) ?? 0, l.share));
  }
  // Top-repo languages are already covered by `languages`, but a repo with
  // no language stats still signals the skill — keep the map complete.
  for (const r of analysis.topRepos) {
    if (r.language) {
      const key = norm(r.language);
      if (!skills.has(key)) skills.set(key, 0.1);
    }
  }
  return skills;
}

function matchOne(job: Job, skills: Map<string, number>): JobMatch {
  const matched: string[] = [];
  const related: string[] = [];
  const missing: string[] = [];
  let credit = 0;

  for (const required of job.skills) {
    const key = norm(required);
    if (skills.has(key)) {
      matched.push(required);
      credit += 1;
    } else {
      // Partial credit: user has a language whose ecosystem covers this.
      const coveredBy = [...skills.keys()].find((have) =>
        (ECOSYSTEM[have] ?? []).includes(key),
      );
      if (coveredBy) {
        related.push(required);
        credit += 0.5;
      } else {
        missing.push(required);
      }
    }
  }

  const score = Math.round((credit / job.skills.length) * 100);
  const reason =
    matched.length === job.skills.length
      ? `Covers all ${job.skills.length} required skills — strong fit.`
      : matched.length === 0 && related.length === 0
        ? `No overlap yet — learning ${missing.slice(0, 2).join(" or ")} would open this role.`
        : `Matches ${matched.length + related.length} of ${job.skills.length} skills` +
          (related.length > 0
            ? ` (${related.length} via related ${related.length === 1 ? "skill" : "skills"})`
            : "") +
          (missing.length > 0
            ? ` — missing: ${missing.join(", ")}.`
            : ".");

  return { job, score, matched, related, missing, reason };
}

/** Top matches for an analyzed profile, best first. */
export function matchJobs(
  analysis: Analysis,
  jobs: Job[] = JOBS,
  limit = 5,
): JobMatch[] {
  const skills = userSkills(analysis);
  return jobs
    .map((job) => matchOne(job, skills))
    .sort((a, b) => b.score - a.score || a.job.id.localeCompare(b.job.id))
    .slice(0, limit);
}
