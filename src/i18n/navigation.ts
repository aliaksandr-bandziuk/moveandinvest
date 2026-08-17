import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link/redirect/usePathname/useRouter. Always import these
// rather than the ones from `next/link` and `next/navigation` — the plain
// Next.js versions do not know about the locale prefix and will silently
// drop a visitor from /ru/... back to the English route.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
