# RozgarAI — Push Guide (GitHub)

Goal: make this code a **public GitHub repo** so the Code for a Billion
submission can link it as `[REPO_URL]`.

**Current state (10 Nov 2026, ~23:10 WIB):** the local repo is complete and
clean — 5 commits, latest `52e62ef`, branch `master`, working tree clean,
no remote configured. **No GitHub account or repo exists for the user yet**
(searched `~/MEMORY.md`, `~/memory/`, and this repo — nothing found).
Creating the account/repo is a user step; everything else is ready.

> If a new GitHub account is needed, create it with
> **bambanghendri71@gmail.com** (user instruction, 10 Nov 22:51 WIB).

## Steps

### 1. Create the repo on GitHub (user, ~2 minutes)

1. Sign in to GitHub (or create the account first, with the email above).
2. **New repository**, name: `rozgar-ai`, visibility: **Public**.
3. **Do NOT** tick "Add a README", "Add .gitignore", or "Choose a license" —
   the repo already has `README.md`, `.gitignore`, and `LICENSE` (MIT).
4. Create the repo. GitHub shows a page with the repo URL, e.g.
   `https://github.com/<username>/rozgar-ai`.

### 2. Push from this machine (agent or user)

```bash
cd ~/workspace/bounties/rozgar-ai
git remote add origin https://github.com/<username>/rozgar-ai.git
git push -u origin master
```

Notes:

- Branch is `master` (not `main`) — push `master`.
- `node_modules/`, `.next/`, and `.vercel/` are gitignored and will not be
  pushed. Only source, docs, data, and `demo/rozgarai-demo.mp4` go up.
- If GitHub asks for credentials, use a **Personal Access Token (classic)**
  with `repo` scope, or `gh auth login`. Never paste passwords or tokens
  into chat.

### 3. Verify

- Open `https://github.com/<username>/rozgar-ai` — the README should render
  and `demo/rozgarai-demo.mp4` (2.4 MB) should be listed under `demo/`.
- Copy the repo URL and paste it into `SUBMISSION.md`, replacing
  `[REPO_URL]`.

## What stays blocked after the push

- `[DEPLOY_URL]` — needs a free Vercel account + deploy of this repo,
  unless the user's 09:33 WIB Vercel sign-in on 10 Nov already claimed
  the temporary deployment (claim link expired 10:29 WIB; status
  unconfirmed — check the user's Vercel dashboard first).
- `[DEMO_VIDEO_URL]` — needs `demo/rozgarai-demo.mp4` uploaded to YouTube
  (unlisted).
- AgentFoundry.me registration + opening this repo in the AgentFoundry IDE
  (hackathon rules require building in AgentFoundry).
- The final submit: open a new issue in
  [`karlmehta/code-for-a-billion`](https://github.com/karlmehta/code-for-a-billion)
  with the filled-in `SUBMISSION.md`, **before Sun 15 Nov 2026, 12:00 WIB**.
