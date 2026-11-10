# RozgarAI — Impact Report (Phase 4)

**Date:** 10 Nov 2026 · **Sample:** 50 real Indian beginner GitHub profiles ·
**Method:** every profile run through the live Analyzer + Job Matcher +
Skill-Gap Plan (the same code that ships in the app) · **Raw data:**
[`impact-results.json`](impact-results.json)

## Headline numbers

| Metric | Result |
|---|---|
| Profiles analyzed | **50** |
| Average score (0–100) | **37.6** (median 38, range 15–72) |
| Beginner band (<40) | **29 (58%)** |
| Growing band (40–69) | **20 (40%)** |
| Job-Ready band (≥70) | **1 (2%)** |
| Usable job match (top match ≥50%) | **13 (26%)** |
| Got a 4-week skill-gap plan | **50 (100%)** |

## What the scores say

Beginners are not failing on talent — they are failing on *proof*.
Average component scores (each out of 25):

| Component | Avg | What it means |
|---|---|---|
| Profile completeness | 12.5 | Half the profiles lack a bio, location, or portfolio link |
| Activity & consistency | 8.2 | Almost nobody pushed code in the last 90 days |
| Project quality | 5.6 | Few descriptions, almost no stars/forks |
| Language breadth & focus | 11.2 | Most already work in a job-market language |

## Most common gaps (out of 50)

| Gap | Profiles |
|---|---|
| No recent activity (nothing pushed in 90 days) | **50 (100%)** |
| No portfolio/personal site linked | 21 |
| Only 1 public repo | 17 |
| Repos without a description | 11 |
| Only 2 public repos | 10 |
| No bio | 8 |

The single most common gap — inactivity — is also the cheapest to fix:
one push a week moves the activity score and makes the profile look alive
to recruiters.

## Most common skills the plans target

| Focus skill | Profiles whose plan targets it |
|---|---|
| SQL | 42 |
| Java | 37 |
| Python | 33 |
| Communication | 33 |
| TypeScript | 7 |
| CSS | 6 |

## Top languages in the sample

JavaScript (7), HTML (5), Python (4), Jupyter Notebook (4), Java (3),
TypeScript (2). The stack beginners already use overlaps heavily with
entry-level India hiring — the gap is depth and proof, not the wrong stack.

## Best profiles in the run

| Profile | Score | Band | Top language | Top match |
|---|---|---|---|---|
| omeshwarreddykona | 72 | Job-Ready | JavaScript | Frontend Developer (Fresher) @ Lenskart — 63% |
| Sarnendu74 | 69 | Growing | Python | Programmer Analyst Trainee @ Cognizant — 70% |
| arghyaInnovator | 62 | Growing | HTML | Frontend Developer Intern @ Zomato — 70% |
| webdev-adi-official | 56 | Growing | JavaScript | Frontend Developer Intern @ Zomato — 70% |
| Shivankjadli | 54 | Growing | JavaScript | Frontend Developer Intern @ Zomato — 70% |

## What this proves (for the judges)

1. **The tool works on real beginners, not just famous accounts.**
   All 50 profiles came from public GitHub Search (location:India,
   ≤20 followers, 1–15 repos, created after 2023) — the exact audience
   Track #10 serves. Every one of them got a score, strengths, gaps,
   job matches, and a 4-week plan.
2. **The problem is real and measurable.** 58% score Beginner, and
   100% share the same cheapest fix (recent activity). That is a
   coaching problem RozgarAI can solve in one plan, not a talent
   shortage.
3. **The path to a job is visible for 1 in 4 already.** 26% of these
   beginners already match an entry-level role at ≥50% on skills their
   GitHub proves — before any upskilling. The plan exists to lift the
   other 74%.

## Methodology & limits (honest)

- **Source:** GitHub Search API, query
  `location:India followers:0..20 repos:1..15 created:>2023-01-01`,
  first 60 results; 50 analyzed (10 skipped: duplicates, 404s, or
  accounts with no analyzable repos). Location is self-reported on
  GitHub; all 50 analyzed profiles list an India location.
- **Cost:** 2 unauthenticated GitHub API requests per profile
  (user + repos), 100 total, run inside the 60/hour limit with
  automatic sleeps at the reset boundary.
- **Jobs:** matched against the 25-role seed dataset
  (`src/data/jobs-seed.json`) — representative entry-level India tech
  roles, not live listings. Match % measures skill overlap with the
  role's required skills, not a hiring guarantee.
- **Sample size:** 50 is a pilot, not a census. The same script
  (`scripts/impact-run.ts`) re-runs to grow the sample; it resumes
  from `impact-results.json` and respects the rate limit.
