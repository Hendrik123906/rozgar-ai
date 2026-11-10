import { getAnalysis, validUsername } from "@/lib/analyze-user";
import { GitHubError } from "@/lib/github";
import { buildPortfolioHtml, portfolioFileName } from "@/lib/portfolio";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();

  if (!username || !validUsername(username)) {
    return new Response(
      JSON.stringify({
        error: "Provide a valid GitHub username (letters, numbers, hyphens).",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { analysis } = await getAnalysis(username);
    const html = buildPortfolioHtml(analysis);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${portfolioFileName(analysis.username)}"`,
      },
    });
  } catch (err) {
    if (err instanceof GitHubError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("portfolio failed", err);
    return new Response(
      JSON.stringify({
        error: "Could not reach GitHub. Check your connection and try again.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
