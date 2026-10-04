import type { NextConfig } from "next";

/**
 * Static export mode for GitHub Pages:
 *   STATIC_EXPORT=1 next build  →  pure static site in ./out
 *   - served from https://<user>.github.io/pytorch/  →  basePath "/pytorch"
 *   - API route handlers (GET-only) are evaluated at build time and become static JSON
 *   - images unoptimized (no sharp/node server on Pages)
 * Normal dev / standalone builds are untouched.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const REPO_BASE_PATH = "/pytorch";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      basePath: REPO_BASE_PATH,
      env: { NEXT_PUBLIC_BASE_PATH: REPO_BASE_PATH },
      images: { unoptimized: true },
      typescript: { ignoreBuildErrors: true },
      reactStrictMode: false,
    }
  : {
      output: "standalone",
      typescript: { ignoreBuildErrors: true },
      reactStrictMode: false,
    };

export default nextConfig;
