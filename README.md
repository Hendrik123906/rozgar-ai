# RozgarAI — First Tech Jobs for India's Young Coders

> **Code for a Billion (Bharat Agentic-AI Hackathon 2026) · Track #10 Tech
> Employment for Youth**

RozgarAI turns a beginner coder's public GitHub profile into a job-search
launchpad: a profile score with explainable strengths and gaps, matched
entry-level jobs and internships, a shareable one-page portfolio, and a
4-week skill-gap plan built from free learning resources.

The full problem statement — with verified numbers — is in
[`PROBLEM.md`](./PROBLEM.md).

## The four agents

| Agent | Status | What it does |
| --- | --- | --- |
| **GitHub Analyzer** | ✅ Live (Day 1) | Scores a GitHub profile 0–100 across profile completeness, activity, project quality, and language breadth — with strengths and gaps |
| **Job Matcher** | ✅ Live (Day 2) | Matches the profile against 25 entry-level jobs/internships with a 0–100 match score, matched/related/missing skills, and a reason per match |
| **Portfolio Builder** | ✅ Live (Day 2) | Generates a self-contained one-page HTML portfolio from the GitHub data, downloadable from the UI or via API |
| **Skill-Gap Plan** | 🚧 Day 3 | Builds a 4-week learning plan from the gap to the matched jobs |

## How the score works

The Analyzer is deterministic and explainable — no black box. Four
components, 25 points each:

1. **Profile completeness** — bio, location, website, company, contact.
2. **Activity & consistency** — own repos, repos updated in the last 90
   days, account age, most recent push.
3. **Project quality** — share of repos with a description, stars + forks,
   best repo, showcase links/topics.
4. **Language breadth & focus** — distinct languages, job-market languages,
   top-language focus.

Bands: **Beginner** 0–39 · **Growing** 40–69 · **Job-Ready** 70–100.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

No API keys needed. The Analyzer uses the public GitHub REST API without
authentication (60 requests/hour, 2 requests per analysis). Set a
`GITHUB_TOKEN` env var to raise the limit.

## API

| Endpoint | What it returns |
| --- | --- |
| `GET /api/analyze?username=<name>` | Profile analysis (score, strengths, gaps, languages, top repos) |
| `GET /api/match?username=<name>` | Analysis + top 5 job matches with scores and reasons |
| `GET /api/portfolio?username=<name>` | One-page portfolio as a downloadable `.html` file |

The Matcher is deterministic: exact language matches count full, JS/TS
ecosystem skills (React, Node.js, Next.js, Tailwind) and C↔C++ count half,
everything else needs an exact match. The Portfolio Builder runs in the
browser too — the UI download reuses the analysis already on screen, so it
costs no extra GitHub API calls.

## Deploy

One-click deploy to Vercel (free tier) from AgentFoundry, or:

```bash
npx vercel deploy
```

Requires a Vercel account (free). The app is a standard Next.js 16 App
Router project — no server state, no database.

## Data

- `src/data/jobs-seed.json` — 25 representative entry-level tech roles in
  India (seed dataset compiled from public job-board patterns, Nov 2026 —
  verify before applying; replaced by a live feed in a later milestone).
- All profile data comes from the public GitHub API at request time; nothing
  is stored.

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
GitHub REST API · Vercel.

## License

MIT — see `LICENSE` (to be added before submission).
