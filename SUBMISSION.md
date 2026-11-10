# Code for a Billion — Submission Draft: RozgarAI

> **DRAFT ONLY — do not submit as-is.** Fill in the `[DEPLOY_URL]`
> and `[DEMO_VIDEO_URL]` placeholders (repo URL is filled — see the
> checklist at the bottom), then paste this into the submission form as a new issue in
> [`karlmehta/code-for-a-billion`](https://github.com/karlmehta/code-for-a-billion).
> **Deadline: Sunday 15 Nov 2026, before 12:00 WIB.**

---

## Project title

**RozgarAI — First Tech Jobs for India's Young Coders**

## Track

**#10 — Tech Employment for Youth**

## Project summary

RozgarAI turns a beginner coder's public GitHub profile into a job-search
launchpad, in one flow and for free: a profile score with explainable
strengths and gaps, matched entry-level jobs and internships, a shareable
one-page portfolio, and a 4-week skill-gap plan built from free learning
resources. No sign-up, no API keys, no paywall — paste a GitHub username
and get a plan to a first tech job in minutes.

## The problem

India has the world's largest youth population and the world's
fastest-growing developer community — but the bridge between learning to
code and getting a first tech job is broken.

**Size (how many people are affected):**

- **371 million Indians are aged 15–29** — about **27% of the country's
  population** (PLFS / MoSPI).
- **17 million developers in India are on GitHub**, growing **28% year
  over year** (GitHub Octoverse 2024). India added **5.2 million
  developers in a single year** (Octoverse 2025) — one in every three new
  developers joining GitHub worldwide — and is projected to become the
  **world's largest developer community by 2028**.
- NASSCOM expects **~2.7 million new and reskilled AI jobs by 2028**.

**Severity (how much it hurts):**

- Youth unemployment (ages 15–29) was **10.2% in 2023-24** (PLFS, MoSPI)
  — more than **3x the overall unemployment rate of 3.2%**. In urban
  India it is **14.7%**; for educated youth (secondary education and
  above) it is **15.4%**.
- Youth labour-force participation is only **46.5%**, versus 60.1% for the
  working-age population.
- The India Skills Report 2026 found **44 out of every 100 graduates are
  not employable** — degrees do not translate into job-ready proof of
  skill.

**The policy moment:** on 15 August 2026, Prime Minister Narendra Modi
pledged **AI skills training for 1 crore (10 million) young Indians over
the next year**, and the government's YUVA AI for ALL programme already
had **85.27 lakh enrolments as of 8 July 2026**. Ten million newly
AI-trained youth will need exactly what RozgarAI does: a way to **prove**
their skills, **find** matching first jobs, and **close** the remaining
skill gap — at scale, in minutes, for free.

The gap is a **proof gap, not a talent gap**: a beginner's GitHub profile
is scattered, unranked and invisible to recruiters; entry-level jobs are
scattered across dozens of portals; and there is no guided plan that
turns "what I know" into "what this job needs".

## The solution — four agents, one flow

| Agent | What it does |
|---|---|
| **GitHub Analyzer** | Reads a user's public repos, languages and activity and scores the profile 0–100 (profile completeness, activity, project quality, language breadth) with explainable strengths and gaps |
| **Job Matcher** | Matches the profile against 25 entry-level jobs/internships in Indian tech, with a 0–100 match score, matched/related/missing skills, and a reason per match |
| **Portfolio Builder** | Generates a self-contained one-page HTML portfolio from the GitHub data, ready to share with recruiters |
| **Skill-Gap Plan** | Builds a 4-week learning plan from the gap between the profile and the matched jobs, using free learning resources |

**Tech:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
public GitHub REST API (no key needed) · Vercel. Open source (MIT).

## Proven impact — pilot run on 50 real beginners (10 Nov 2026)

We ran RozgarAI against **50 real Indian beginner GitHub profiles**
(location:India, ≤20 followers, 1–15 repos, created after 2023 — the
exact audience Track #10 serves), using the same code that ships in the
app. Full report in the repo: `IMPACT.md`; raw data:
`impact-results.json` (re-runnable via `scripts/impact-run.ts`).

| Metric | Result |
|---|---|
| Profiles analyzed | **50** |
| Average score (0–100) | **37.6** (median 38, range 15–72) |
| Beginner band (<40) | **29 (58%)** |
| Growing band (40–69) | **20 (40%)** |
| Job-Ready band (≥70) | **1 (2%)** |
| Usable job match (top match ≥50%) | **13 (26%)** |
| Got a 4-week skill-gap plan | **50 (100%)** |

What this proves:

1. **The tool works on real beginners, not just famous accounts.**
   Every one of the 50 got a score, strengths, gaps, job matches, and a
   4-week plan.
2. **The problem is real and measurable.** 58% score Beginner, and 100%
   share the same cheapest fix — no push in the last 90 days. That is a
   coaching problem RozgarAI can solve in one plan, not a talent
   shortage.
3. **The path to a job is visible for 1 in 4 already.** 26% of these
   beginners already match an entry-level role at ≥50% on skills their
   GitHub proves — before any upskilling. The plan exists to lift the
   other 74%.

## Demo

- **Demo video (2 min):** [DEMO_VIDEO_URL] — file `demo/rozgarai-demo.mp4`
  (2 min) is in the repo; upload to YouTube (unlisted) and paste the link
  here.
- **Live demo:** [DEPLOY_URL]
- **Public repo:** https://github.com/Hendrik123906/rozgar-ai

## How it was built

Built with the standard Next.js 16 toolchain (Next.js 16.4.6, React 19,
TypeScript, Tailwind CSS 4). AgentFoundry IDE v0.1.80 is installed and
verified running on Linux; the repo is opened in the AgentFoundry IDE
before submission (registration pending — see checklist). Deploy target is
Vercel (free tier). The Analyzer uses the public GitHub REST API without
authentication (60 requests/hour, 2 requests per analysis); a
`GITHUB_TOKEN` env var raises the limit.

Verified 10 Nov 2026: production build passes clean (TypeScript clean, 8
static pages, 4 API routes); live smoke test of the production build —
home page 200, `/api/analyze?username=octocat` 200 (score 61/100, Growing),
`/api/match` 200 (5 job matches), `/api/skillgap` 200.

## Team

- **Builder (Indonesia)** — runs an AI-agent operation (Binance Agent ID
  `bambang7010.ai`) with daily on-chain work and production software
  shipped across 200+ collections; active in the Hyperliquid/Elysium
  ecosystem.
- **AI agent (build partner)** — ships production software daily, including
  a rug-check scanner panel (24 shipped versions) and BSC contract-audit
  tooling.

---

## Pre-submit checklist (for the user — agent cannot do these)

- [ ] **Register at [AgentFoundry.me](https://agentfoundry.me)** (free;
      1M free Smart-Code tokens) and **open this repo in the AgentFoundry
      IDE** — the hackathon rules require building in AgentFoundry.
- [ ] **Create a free Vercel account** and deploy the repo for the
      permanent live demo, then replace `[DEPLOY_URL]` above with the
      live URL. (Note: the temporary deployment's claim link expired
      10:29 WIB 10 Nov — but the user's Vercel sign-in at 09:33 WIB that
      morning may have claimed it in time; if the deployment is already
      live under the user's Vercel account, use that URL instead of a
      fresh deploy.)
- [x] **Create a public GitHub repo** and push this code — DONE 10 Nov 2026: https://github.com/Hendrik123906/rozgar-ai
- [ ] **Upload `demo/rozgarai-demo.mp4` to YouTube (unlisted)** and
      replace `[DEMO_VIDEO_URL]` above with the video link.
- [ ] **Submit before Sun 15 Nov 2026, 12:00 WIB:** open a new issue in
      [`karlmehta/code-for-a-billion`](https://github.com/karlmehta/code-for-a-billion)
      using the issue form, and paste this submission.
- [ ] **Ask in GitHub Discussions (Day 1 follow-up):** how prizes are paid
      to non-India winners — not documented anywhere in the hackathon
      pages.
