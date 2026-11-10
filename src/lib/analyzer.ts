// RozgarAI — GitHub Analyzer Agent
// Scores a beginner coder's public GitHub profile (0-100) using only the
// public GitHub REST API (no auth, 2 calls per analysis). Every component is
// deterministic and explainable: the score is a sum of four 25-point parts.

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  company: string | null;
  email: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  homepage: string | null;
  license: { spdx_id: string | null } | null;
  pushed_at: string;
  created_at: string;
  fork: boolean;
  archived: boolean;
  html_url: string;
}

export interface ScoreComponent {
  key: string;
  label: string;
  score: number;
  max: number;
  detail: string;
}

export interface LanguageStat {
  language: string;
  count: number;
  share: number; // 0..1 of non-fork repos with a language
}

export interface TopRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  pushedAt: string;
}

export interface Analysis {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  accountAgeDays: number;
  score: {
    total: number;
    band: "Beginner" | "Growing" | "Job-Ready";
    components: ScoreComponent[];
  };
  strengths: string[];
  gaps: string[];
  languages: LanguageStat[];
  topRepos: TopRepo[];
  recentActivity: {
    reposUpdated90d: number;
    lastPushAt: string | null;
  };
}

const JOB_MARKET_LANGUAGES = new Set([
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "Go",
  "C++",
  "C#",
  "Kotlin",
  "Ruby",
  "PHP",
  "Swift",
  "Rust",
  "Dart",
]);

function daysAgo(iso: string, now: number): number {
  return (now - new Date(iso).getTime()) / 86_400_000;
}

export function analyzeProfile(
  user: GitHubUser,
  repos: GitHubRepo[],
  now = Date.now(),
): Analysis {
  const ownRepos = repos.filter((r) => !r.fork && !r.archived);
  const accountAgeDays = Math.max(
    0,
    Math.round((now - new Date(user.created_at).getTime()) / 86_400_000),
  );

  // ---- 1. Profile completeness (25) ----
  let profileScore = 0;
  if (user.bio) profileScore += 6;
  if (user.location) profileScore += 5;
  if (user.blog) profileScore += 5;
  if (user.company) profileScore += 4;
  if (user.email || user.twitter_username) profileScore += 3;
  if (user.name) profileScore += 2;

  // ---- 2. Activity & consistency (25) ----
  const lastPushAt =
    ownRepos.length > 0
      ? ownRepos
          .map((r) => r.pushed_at)
          .sort()
          .reverse()[0]
      : null;
  const reposUpdated90d = ownRepos.filter(
    (r) => daysAgo(r.pushed_at, now) <= 90,
  ).length;
  let activityScore = 0;
  activityScore += Math.min(10, ownRepos.length); // 1 pt per own repo, cap 10
  activityScore += Math.min(5, reposUpdated90d); // 1 pt per recently active repo, cap 5
  activityScore += accountAgeDays >= 365 ? 5 : accountAgeDays >= 180 ? 3 : 0;
  if (lastPushAt) {
    const d = daysAgo(lastPushAt, now);
    activityScore += d <= 30 ? 5 : d <= 90 ? 3 : 0;
  }

  // ---- 3. Project quality (25) ----
  const withDescription = ownRepos.filter((r) => r.description).length;
  const descRatio = ownRepos.length > 0 ? withDescription / ownRepos.length : 0;
  const totalStars = ownRepos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = ownRepos.reduce((s, r) => s + r.forks_count, 0);
  const social = totalStars + totalForks;
  const bestStars = ownRepos.reduce(
    (m, r) => Math.max(m, r.stargazers_count),
    0,
  );
  const hasShowcase = ownRepos.some(
    (r) => r.homepage || r.topics.length > 0,
  );
  let qualityScore = 0;
  qualityScore += Math.round(descRatio * 8);
  qualityScore +=
    social >= 20 ? 10 : social >= 10 ? 8 : social >= 5 ? 6 : social >= 1 ? 4 : 0;
  qualityScore += bestStars >= 10 ? 4 : bestStars >= 3 ? 2 : 0;
  qualityScore += hasShowcase ? 3 : 0;

  // ---- 4. Language breadth & focus (25) ----
  const langCounts = new Map<string, number>();
  for (const r of ownRepos) {
    if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
  }
  const langEntries = [...langCounts.entries()].sort((a, b) => b[1] - a[1]);
  const distinctLangs = langEntries.length;
  const totalLangRepos = langEntries.reduce((s, [, c]) => s + c, 0);
  const topShare = totalLangRepos > 0 ? langEntries[0][1] / totalLangRepos : 0;
  const hasJobLanguage = langEntries.some(([l]) =>
    JOB_MARKET_LANGUAGES.has(l),
  );
  let languageScore = 0;
  languageScore +=
    distinctLangs === 0
      ? 0
      : distinctLangs === 1
        ? 6
        : distinctLangs <= 3
          ? 10
          : distinctLangs <= 5
            ? 12
            : 8;
  languageScore += hasJobLanguage ? 8 : 0;
  // Focus is good for a beginner: one dominant language (40%+) means depth.
  languageScore += topShare >= 0.4 ? 5 : topShare > 0 ? 2 : 0;

  const total = profileScore + activityScore + qualityScore + languageScore;
  const band =
    total >= 70 ? "Job-Ready" : total >= 40 ? "Growing" : "Beginner";

  const components: ScoreComponent[] = [
    {
      key: "profile",
      label: "Profile completeness",
      score: profileScore,
      max: 25,
      detail: [
        user.bio ? "bio set" : "no bio",
        user.location ? "location set" : "no location",
        user.blog ? "website linked" : "no website",
      ].join(" · "),
    },
    {
      key: "activity",
      label: "Activity & consistency",
      score: activityScore,
      max: 25,
      detail: `${ownRepos.length} own repos · ${reposUpdated90d} updated in last 90 days · account ${accountAgeDays}d old`,
    },
    {
      key: "quality",
      label: "Project quality",
      score: qualityScore,
      max: 25,
      detail: `${totalStars} stars · ${totalForks} forks · ${Math.round(descRatio * 100)}% repos have a description`,
    },
    {
      key: "languages",
      label: "Language breadth & focus",
      score: languageScore,
      max: 25,
      detail:
        distinctLangs === 0
          ? "no language detected"
          : `${distinctLangs} language${distinctLangs > 1 ? "s" : ""} · top: ${langEntries[0][0]} (${Math.round(topShare * 100)}%)`,
    },
  ];

  const strengths: string[] = [];
  const gaps: string[] = [];
  if (ownRepos.length >= 5) strengths.push(`${ownRepos.length} public repos — good body of work`);
  else gaps.push(`Only ${ownRepos.length} public repos — aim for 5+ projects that show your skills`);
  if (reposUpdated90d >= 3) strengths.push(`Active recently — ${reposUpdated90d} repos updated in the last 90 days`);
  else gaps.push("No recent activity — push a commit or update a repo in the last 90 days");
  if (totalStars >= 5) strengths.push(`${totalStars} stars from the community — people find your work useful`);
  if (descRatio >= 0.8 && ownRepos.length > 0) strengths.push("Nearly every repo has a description — recruiters can tell what each project does");
  else if (ownRepos.length > 0) gaps.push(`${ownRepos.length - withDescription} repos have no description — add one line explaining what each project does`);
  if (!user.bio) gaps.push("Add a bio — one line saying what you build and what job you want");
  if (!user.location) gaps.push("Add your location — recruiters filter by city");
  if (!user.blog) gaps.push("Link a portfolio or personal site (RozgarAI can generate one for you)");
  if (distinctLangs >= 2 && hasJobLanguage) strengths.push(`Working in job-market languages (${langEntries.filter(([l]) => JOB_MARKET_LANGUAGES.has(l)).map(([l]) => l).slice(0, 3).join(", ")})`);
  if (distinctLangs > 5) gaps.push("Too many languages — depth in 2–3 beats a little of everything");
  if (bestStars >= 10) strengths.push(`Your best repo has ${bestStars} stars — feature it on your portfolio`);
  if (strengths.length === 0) strengths.push("Profile exists and is public — the starting point for everything else");

  const languages: LanguageStat[] = langEntries.map(([language, count]) => ({
    language,
    count,
    share: totalLangRepos > 0 ? count / totalLangRepos : 0,
  }));

  const topRepos: TopRepo[] = [...ownRepos]
    .sort(
      (a, b) =>
        b.stargazers_count + b.forks_count - (a.stargazers_count + a.forks_count),
    )
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      url: r.html_url,
      pushedAt: r.pushed_at,
    }));

  return {
    username: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    location: user.location,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    accountAgeDays,
    score: { total, band, components },
    strengths,
    gaps,
    languages,
    topRepos,
    recentActivity: { reposUpdated90d, lastPushAt },
  };
}
