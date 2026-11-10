import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RozgarAI — First Tech Jobs for India's Young Coders",
  description:
    "Turn a beginner coder's GitHub profile into a job-search launchpad: profile score, matched entry-level jobs, a shareable portfolio, and a 4-week skill-gap plan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
