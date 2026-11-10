// Minimal Node type shim for the impact-run script only.
// The repo has no @types/node; this keeps tsc happy without adding deps.
declare module "fs";
declare module "path";
declare const process: {
  cwd(): string;
  exit(code?: number): never;
  env: Record<string, string | undefined>;
};
