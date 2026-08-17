import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the workspace root: sibling directories under D:\applications carry
  // their own lockfiles, which would otherwise make Next.js infer the wrong
  // root and resolve modules from a neighbouring project.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default withNextIntl(nextConfig);
