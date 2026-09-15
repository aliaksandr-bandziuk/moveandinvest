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
  // A SLUG CHANGED AFTER PUBLICATION. The first Poland entry went live on the
  // morning of 15 September 2026 at a slug without its main query in it and
  // was renamed the same day, when it was rebuilt around "проверка статуса
  // карты побыту". Hours old, but already in the sitemap, so the old address
  // answers with a permanent redirect rather than a 404.
  async redirects() {
    return [
      {
        source: "/ru/blog/karta-pobytu-dolgo-rassmatrivayut",
        destination: "/ru/blog/status-karty-pobytu",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
