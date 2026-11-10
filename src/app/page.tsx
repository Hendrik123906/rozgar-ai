"use client";

import { useState } from "react";
import type { Analysis } from "@/lib/analyzer";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; analysis: Analysis; rateRemaining: number | null };

const BAND_STYLE: Record<Analysis["score"]["band"], string> = {
  Beginner: "bg-amber-100 text-amber-800 border-amber-300",
  Growing: "bg-sky-100 text-sky-800 border-sky-300",
  "Job-Ready": "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const EXAMPLES = ["torvalds", "gaearon", "sindresorhus"];

export default function Home() {
  const [username, setUsername] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function analyze(name: string) {
    const u = name.trim();
    if (!u) return;
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/analyze?username=${encodeURIComponent(u)}`);
      const json = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: json.error || "Analysis failed." });
        return;
      }
      setState({
        kind: "done",
        analysis: json.analysis as Analysis,
        rateRemaining: json.rateLimit?.remaining ?? null,
      });
    } catch {
      setState({
        kind: "error",
        message: "Could not reach the server. Try again.",
      });
    }
  }

  const a = state.kind === "done" ? state.analysis : null;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Rozgar<span className="text-emerald-600">AI</span>
          </h1>
          <p className="mt-2 text-zinc-600">
            Turn a beginner coder&apos;s GitHub profile into a job-search
            launchpad — score, strengths, gaps, and next steps.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Code for a Billion · Track #10 Tech Employment for Youth
          </p>
        </header>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            analyze(username);
          }}
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub username, e.g. torvalds"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            aria-label="GitHub username"
          />
          <button
            type="submit"
            disabled={state.kind === "loading"}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {state.kind === "loading" ? "Analyzing…" : "Analyze"}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <span>Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setUsername(ex);
                analyze(ex);
              }}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1 hover:border-emerald-500 hover:text-emerald-700"
            >
              {ex}
            </button>
          ))}
        </div>

        {state.kind === "error" && (
          <div className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">
            {state.message}
          </div>
        )}

        {state.kind === "loading" && (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-500">
            Reading public repos from GitHub…
          </div>
        )}

        {a && (
          <section className="mt-8 space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.avatarUrl}
                  alt={`${a.username}'s avatar`}
                  className="h-16 w-16 rounded-full border border-zinc-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={a.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xl font-bold hover:text-emerald-700"
                    >
                      {a.name || a.username}
                    </a>
                    <span className="text-zinc-500">@{a.username}</span>
                  </div>
                  {a.bio && <p className="mt-1 text-sm text-zinc-600">{a.bio}</p>}
                  <p className="mt-1 text-xs text-zinc-400">
                    {a.publicRepos} public repos · {a.followers} followers ·{" "}
                    {a.following} following · account {a.accountAgeDays} days
                    old
                    {a.location ? ` · ${a.location}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-extrabold">
                    {a.score.total}
                    <span className="text-lg text-zinc-400">/100</span>
                  </div>
                  <span
                    className={`mt-1 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${BAND_STYLE[a.score.band]}`}
                  >
                    {a.score.band}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {a.score.components.map((c) => (
                  <div key={c.key}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{c.label}</span>
                      <span className="text-zinc-500">
                        {c.score}/{c.max}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${(c.score / c.max) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">{c.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="font-bold text-emerald-900">Strengths</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-900">
                  {a.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="font-bold text-amber-900">Gaps to fix</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                  {a.gaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>

            {a.languages.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h2 className="font-bold">Languages</h2>
                <div className="mt-3 space-y-2">
                  {a.languages.slice(0, 6).map((l) => (
                    <div key={l.language} className="flex items-center gap-3 text-sm">
                      <span className="w-28 shrink-0 font-medium">
                        {l.language}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-sky-500"
                          style={{ width: `${Math.round(l.share * 100)}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-zinc-500">
                        {l.count} repos · {Math.round(l.share * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {a.topRepos.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h2 className="font-bold">Top repositories</h2>
                <ul className="mt-3 space-y-3">
                  {a.topRepos.map((r) => (
                    <li key={r.name} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-700 hover:underline"
                      >
                        {r.name}
                      </a>
                      <span className="ml-2 text-xs text-zinc-400">
                        ★ {r.stars} · ⑂ {r.forks}
                        {r.language ? ` · ${r.language}` : ""}
                      </span>
                      {r.description && (
                        <p className="mt-0.5 text-sm text-zinc-600">{r.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {state.kind === "done" && state.rateRemaining !== null && (
              <p className="text-center text-xs text-zinc-400">
                GitHub API requests remaining this hour: {state.rateRemaining} ·
                Analysis uses public data only — no login, no token.
              </p>
            )}
          </section>
        )}

        <footer className="mt-12 text-center text-xs text-zinc-400">
          RozgarAI — an AI agent for first tech jobs in India. Built for Code
          for a Billion, Track #10. Job matching, portfolio builder &amp;
          skill-gap plan landing next.
        </footer>
      </div>
    </main>
  );
}
