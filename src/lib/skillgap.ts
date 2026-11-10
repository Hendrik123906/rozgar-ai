// RozgarAI — Skill-Gap Plan Agent
// Turns an Analyzer result + Job Matcher output into a 4-week learning plan.
// Deterministic and explainable: the focus skills are the missing skills of
// the user's best job matches, ranked by how often they appear across the
// top matches. Every resource is free (official docs, freeCodeCamp, MDN,
// Khan Academy, etc.). No external API calls — pure computation.

import type { Analysis } from "./analyzer";
import type { JobMatch } from "./matcher";

export interface PlanResource {
  title: string;
  url: string;
}

export interface PlanTask {
  text: string;
  type: "learn" | "build" | "profile" | "apply";
  skill?: string;
  resources?: PlanResource[];
}

export interface PlanWeek {
  week: number;
  title: string;
  goal: string;
  tasks: PlanTask[];
  milestone: string;
}

export interface SkillGapPlan {
  targetRole: string;
  targetCompany: string;
  targetScore: number;
  focusSkills: string[];
  alreadyHave: string[];
  weeks: PlanWeek[];
  summary: string;
}

function r(title: string, url: string): PlanResource {
  return { title, url };
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** Free learning resources per skill, keyed by normalized skill name.
 * Two entries max per skill: a guided course first, reference docs second. */
const RESOURCES: Record<string, PlanResource[]> = {
  javascript: [
    r("MDN — JavaScript Guide", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"),
    r("freeCodeCamp — JS Algorithms & Data Structures", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"),
  ],
  typescript: [
    r("TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"),
    r("Total TypeScript — free tutorials", "https://www.totaltypescript.com/tutorials"),
  ],
  python: [
    r("Python Tutorial (docs.python.org)", "https://docs.python.org/3/tutorial/"),
    r("freeCodeCamp — Scientific Computing with Python", "https://www.freecodecamp.org/learn/scientific-computing-with-python/"),
  ],
  java: [
    r("Oracle — Java Tutorials", "https://docs.oracle.com/javase/tutorial/"),
    r("freeCodeCamp — Java course", "https://www.freecodecamp.org/learn/java/"),
  ],
  c: [
    r("Learn-C.org — interactive C tutorial", "https://www.learn-c.org/"),
    r("CS50 — Introduction to Computer Science (free)", "https://cs50.harvard.edu/x/"),
  ],
  "c++": [
    r("learncpp.com — free C++ tutorial", "https://www.learncpp.com/"),
    r("CS50 — Introduction to Computer Science (free)", "https://cs50.harvard.edu/x/"),
  ],
  go: [
    r("A Tour of Go (go.dev)", "https://go.dev/tour/"),
    r("Go — Getting Started", "https://go.dev/doc/tutorial/getting-started"),
  ],
  kotlin: [
    r("Kotlin — Get started", "https://kotlinlang.org/docs/getting-started.html"),
    r("Android Basics with Compose", "https://developer.android.com/courses/android-basics-compose/course"),
  ],
  ruby: [
    r("Ruby in Twenty Minutes", "https://www.ruby-lang.org/en/documentation/quickstart/"),
    r("The Odin Project — Ruby", "https://www.theodinproject.com/paths/full-stack-ruby-on-rails/courses/ruby"),
  ],
  html: [
    r("MDN — HTML basics", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content"),
    r("freeCodeCamp — Responsive Web Design", "https://www.freecodecamp.org/learn/responsive-web-design/"),
  ],
  css: [
    r("MDN — CSS first steps", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics"),
    r("freeCodeCamp — Responsive Web Design", "https://www.freecodecamp.org/learn/responsive-web-design/"),
  ],
  react: [
    r("React — Learn (react.dev)", "https://react.dev/learn"),
    r("freeCodeCamp — Front End Libraries", "https://www.freecodecamp.org/learn/front-end-development-libraries/"),
  ],
  "node.js": [
    r("Node.js — Introduction to Node.js", "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs"),
    r("freeCodeCamp — Back End Development", "https://www.freecodecamp.org/learn/back-end-development-and-apis/"),
  ],
  "next.js": [
    r("Next.js — Learn", "https://nextjs.org/learn"),
    r("Next.js Docs — Getting Started", "https://nextjs.org/docs"),
  ],
  "tailwind css": [
    r("Tailwind CSS — Documentation", "https://tailwindcss.com/docs"),
    r("Tailwind CSS — Installation", "https://tailwindcss.com/docs/installation"),
  ],
  sql: [
    r("SQLBolt — interactive SQL lessons", "https://sqlbolt.com/"),
    r("Mode — SQL Tutorial", "https://mode.com/sql-tutorial"),
  ],
  mysql: [
    r("MySQL Tutorial (dev.mysql.com)", "https://dev.mysql.com/doc/refman/8.0/en/tutorial.html"),
    r("SQLBolt — interactive SQL lessons", "https://sqlbolt.com/"),
  ],
  postgresql: [
    r("PostgreSQL Tutorial", "https://www.postgresql.org/docs/current/tutorial.html"),
    r("SQLBolt — interactive SQL lessons", "https://sqlbolt.com/"),
  ],
  mongodb: [
    r("MongoDB University — free courses", "https://learn.mongodb.com/"),
    r("MongoDB — Getting Started", "https://www.mongodb.com/docs/manual/tutorial/getting-started/"),
  ],
  git: [
    r("Pro Git book (free)", "https://git-scm.com/book/en/v2"),
    r("GitHub Skills — free courses", "https://skills.github.com/"),
  ],
  linux: [
    r("Linux Journey — free lessons", "https://linuxjourney.com/"),
    r("OverTheWire — Bandit wargame", "https://overthewire.org/wargames/bandit/"),
  ],
  docker: [
    r("Docker — Get Started", "https://docs.docker.com/get-started/"),
    r("Docker — Orientation and setup", "https://docs.docker.com/get-started/docker-overview/"),
  ],
  "aws basics": [
    r("AWS Skill Builder — Cloud Practitioner Essentials (free)", "https://skillbuilder.aws/"),
    r("AWS — Getting Started", "https://aws.amazon.com/getting-started/"),
  ],
  cloud: [
    r("AWS Skill Builder — Cloud Practitioner Essentials (free)", "https://skillbuilder.aws/"),
    r("freeCodeCamp — Cloud computing basics", "https://www.freecodecamp.org/news/tag/cloud-computing/"),
  ],
  "cloud basics": [
    r("AWS Skill Builder — Cloud Practitioner Essentials (free)", "https://skillbuilder.aws/"),
    r("freeCodeCamp — Cloud computing basics", "https://www.freecodecamp.org/news/tag/cloud-computing/"),
  ],
  "data structures": [
    r("freeCodeCamp — Data Structures & Algorithms", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"),
    r("VisuAlgo — visualising data structures", "https://visualgo.net/en"),
  ],
  algorithms: [
    r("freeCodeCamp — Data Structures & Algorithms", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"),
    r("VisuAlgo — visualising algorithms", "https://visualgo.net/en"),
  ],
  "system design basics": [
    r("The System Design Primer (GitHub)", "https://github.com/donnemartin/system-design-primer"),
    r("roadmap.sh — System Design", "https://roadmap.sh/system-design"),
  ],
  microservices: [
    r("microservices.io — pattern language", "https://microservices.io/patterns/index.html"),
    r("Microsoft Learn — Architect microservices", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/"),
  ],
  "rest apis": [
    r("MDN — REST glossary", "https://developer.mozilla.org/en-US/docs/Glossary/REST"),
    r("freeCodeCamp — APIs for Beginners", "https://www.freecodecamp.org/news/apis-for-beginners/"),
  ],
  "spring boot": [
    r("Spring — Building a RESTful Web Service", "https://spring.io/guides/gs/rest-service"),
    r("Spring Boot — Getting Started", "https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html"),
  ],
  "android sdk": [
    r("Android Basics with Compose", "https://developer.android.com/courses/android-basics-compose/course"),
    r("Android Developers — Build your first app", "https://developer.android.com/codelabs/basic-android-kotlin-compose-first-app"),
  ],
  excel: [
    r("GCFGlobal — Excel tutorials (free)", "https://edu.gcfglobal.org/en/excel/"),
    r("Microsoft — Excel video training", "https://support.microsoft.com/en-us/office/excel-video-training-396ac9d7-2e35-46b6-b06d-3d0c3a6e3e63"),
  ],
  statistics: [
    r("Khan Academy — Statistics & Probability", "https://www.khanacademy.org/math/statistics-probability"),
    r("freeCodeCamp — Statistics for Data Science", "https://www.freecodecamp.org/news/statistics-for-data-science/"),
  ],
  communication: [
    r("Coursera — Successful Interviewing (audit free)", "https://www.coursera.org/learn/interviewing"),
    r("Indeed — Communication skills guide", "https://www.indeed.com/career-advice/resumes-cover-letters/communication-skills"),
  ],
  "problem solving": [
    r("HackerRank — Practice (free)", "https://www.hackerrank.com/domains/tutorials/10-days-of-javascript"),
    r("LeetCode — Explore (free)", "https://leetcode.com/explore/"),
  ],
  agile: [
    r("The Scrum Guide", "https://scrumguides.org/scrum-guide.html"),
    r("Atlassian — Agile tutorials", "https://www.atlassian.com/agile/tutorials"),
  ],
  "manual testing": [
    r("Guru99 — Manual Testing Tutorial", "https://www.guru99.com/manual-testing.html"),
    r("Ministry of Testing — free resources", "https://www.ministryoftesting.com/"),
  ],
  "selenium basics": [
    r("Selenium — Getting Started", "https://www.selenium.dev/documentation/webdriver/getting_started/"),
    r("Guru99 — Selenium Tutorial", "https://www.guru99.com/selenium-tutorial.html"),
  ],
  "embedded basics": [
    r("Arduino — Getting Started", "https://docs.arduino.cc/learn/starting-guide/"),
    r("Interrupt — embedded systems blog", "https://interrupt.memfault.com/"),
  ],
};

const GENERIC_RESOURCES: PlanResource[] = [
  r("freeCodeCamp — free coding courses", "https://www.freecodecamp.org/learn"),
];

export function resourcesFor(skill: string): PlanResource[] {
  return RESOURCES[norm(skill)] ?? GENERIC_RESOURCES;
}

/** Missing skills of the top matches, ranked by how often they appear
 * across the top 3 matches, then by first appearance. Max `limit`. */
export function focusSkills(matches: JobMatch[], limit = 4): string[] {
  const counts = new Map<
    string,
    { display: string; count: number; first: number }
  >();
  let order = 0;
  for (const m of matches.slice(0, 3)) {
    for (const missing of m.missing) {
      const key = norm(missing);
      const cur = counts.get(key);
      if (cur) cur.count += 1;
      else counts.set(key, { display: missing, count: 1, first: order });
      order += 1;
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.first - b.first)
    .slice(0, limit)
    .map((v) => v.display);
}

/** Turn an Analyzer gap sentence into a short profile task. */
function profileTask(gap: string): PlanTask {
  return { text: gap, type: "profile" };
}

export function buildSkillGapPlan(
  analysis: Analysis,
  matches: JobMatch[],
): SkillGapPlan {
  const target = matches[0];
  const focus = focusSkills(matches);
  const alreadyHave = target ? target.matched.slice(0, 4) : [];
  const profileFixes = analysis.gaps.slice(0, 3).map(profileTask);

  // The skill the plan revolves around: the #1 missing skill, or the user's
  // strongest language when nothing is missing for the top match.
  const primary =
    focus[0] ?? analysis.languages[0]?.language ?? "JavaScript";
  const second = focus[1];
  const third = focus[2];

  const targetRole = target ? target.job.role : "Entry-level software role";
  const targetCompany = target ? target.job.company : "top Indian tech employers";
  const targetScore = target ? target.score : 0;

  // The target role's stack: skills the user already has + focus skills.
  const stack = [...alreadyHave, ...focus].slice(0, 4);
  const stackText =
    stack.length > 0 ? stack.join(", ") : "your strongest language";

  const weeks: PlanWeek[] = [
    {
      week: 1,
      title: `Learn ${primary}`,
      goal: `Close your biggest gap — ${primary} — and fix the quick profile wins.`,
      tasks: [
        {
          text: `Study ${primary} for 45 minutes a day (4–5 days this week).`,
          type: "learn",
          skill: primary,
          resources: resourcesFor(primary),
        },
        {
          text: `Solve 5 beginner exercises in ${primary} — write the code yourself, don't just read.`,
          type: "learn",
          skill: primary,
          resources: resourcesFor(primary),
        },
        ...profileFixes.slice(0, 2),
        // Strong profiles have no quick fixes left — pinning best repos is
        // the remaining high-value profile action.
        ...(profileFixes.length === 0
          ? [
              {
                text: "Pin your 3 best repos to your GitHub profile so recruiters see them first.",
                type: "profile",
              } as PlanTask,
            ]
          : []),
      ],
      milestone: `You can explain ${primary} basics in your own words, and your profile has a bio, location, and repo descriptions.`,
    },
    {
      week: 2,
      title: `Build with ${primary}`,
      goal: `Prove the new skill with a real project on your GitHub.`,
      tasks: [
        {
          text: `Build a small project using ${primary}${second ? ` and ${second}` : ""} and push it to GitHub with a README and a one-line description.`,
          type: "build",
          skill: primary,
          resources: resourcesFor(primary),
        },
        ...(second
          ? [
              {
                text: `Study ${second} for 45 minutes a day (4–5 days this week).`,
                type: "learn",
                skill: second,
                resources: resourcesFor(second),
              } as PlanTask,
            ]
          : [
              {
                text: `Deepen ${primary}: add tests to the project, or contribute a small fix to an open-source repo you already use.`,
                type: "build",
                skill: primary,
                resources: resourcesFor(primary),
              } as PlanTask,
            ]),
        ...profileFixes.slice(2, 3),
      ],
      milestone: `1 new repo using ${primary} on your profile, with a README that explains what it does.`,
    },
    {
      week: 3,
      title: "Target-stack project",
      goal: `Build one project that looks like the work a ${targetRole} does.`,
      tasks: [
        {
          text: `Build a portfolio project using the ${targetRole} stack (${stackText}) — pick a real problem, not a tutorial clone.`,
          type: "build",
          skill: primary,
          resources: resourcesFor(primary),
        },
        {
          text: "Deploy it free (Vercel, Netlify, or GitHub Pages) and put the live link in the README.",
          type: "build",
        },
        ...(third
          ? [
              {
                text: `Study ${third} for 45 minutes a day (4–5 days this week).`,
                type: "learn",
                skill: third,
                resources: resourcesFor(third),
              } as PlanTask,
            ]
          : [
              {
                text: "Write a short README section or blog post explaining how your project works — recruiters read writing, not just code.",
                type: "profile",
              } as PlanTask,
            ]),
      ],
      milestone:
        "A deployed project is linked from your portfolio and README.",
    },
    {
      week: 4,
      title: "Polish & apply",
      goal: "Turn the work into applications.",
      tasks: [
        {
          text: "Regenerate your RozgarAI portfolio and add the Week 3 project to it.",
          type: "profile",
        },
        {
          text: `Apply to your top 3 matches — ${matches
            .slice(0, 3)
            .map((m) => `${m.job.role} at ${m.job.company}`)
            .join(", ")} — with your portfolio link attached.`,
          type: "apply",
        },
        {
          text: `Practice the 10 most common interview questions for ${primary} — answer each out loud in under 2 minutes.`,
          type: "apply",
          skill: primary,
          resources: resourcesFor(primary),
        },
      ],
      milestone: "3 applications sent, each with a portfolio link.",
    },
  ];

  const summary =
    focus.length > 0
      ? `4-week plan to close the gap to ${targetRole} at ${targetCompany} (${targetScore}% match today). Focus: ${focus.join(", ")}.`
      : `No missing skills for your top match — this 4-week plan builds depth in ${primary} and turns your profile into applications.`;

  return {
    targetRole,
    targetCompany,
    targetScore,
    focusSkills: focus,
    alreadyHave,
    weeks,
    summary,
  };
}
