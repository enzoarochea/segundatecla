import type { NextConfig } from "next";

// NEXT_PUBLIC_STATIC=1: storefront-only export for GitHub Pages (no admin, no uploads, no headers).
const isStatic = process.env.NEXT_PUBLIC_STATIC === "1";

const nextConfig: NextConfig = {
  ...(isStatic && { output: "export", basePath: process.env.NEXT_PUBLIC_BASE_PATH, trailingSlash: true }),
  // Static export cannot use Cache Components (PPR); "use cache" still works through experimental.useCache.
  cacheComponents: !isStatic,
  partialPrefetching: !isStatic,
  // Admin photo uploads: up to 5 MB per file (checked again in lib/storage.ts).
  experimental: { serverActions: { bodySizeLimit: "6mb" }, ...(isStatic && { useCache: true }) },
  images: isStatic ? { unoptimized: true } : { localPatterns: [{ pathname: "/uploads/**" }] },
  // shortcut: CSP without script-src, since Next's inline scripts would need per-request nonces
  // (which turn off static/cached pages). Add a nonce-based script-src if the site ever takes third-party scripts.
  ...(!isStatic && { async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  } }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
