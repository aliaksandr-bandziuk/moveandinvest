import { Chip } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { CountryRow } from "../types";
import styles from "./CountryChip.module.scss";

interface CountryChipProps {
  country: Pick<CountryRow, "name" | "status" | "href">;
}

// Wraps the neutral ui/Chip with jurisdiction semantics: a live one links to
// its page, a planned or paused one renders dimmed and inert. The link
// decision lives here rather than in Chip on purpose — ui/ primitives are
// not allowed to know a jurisdiction exists (CLAUDE.md).
export function CountryChip({ country }: CountryChipProps) {
  const isLive = country.status === "live" && Boolean(country.href);
  const chip = (
    <Chip label={country.name} muted={!isLive} />
  );

  if (!isLive || !country.href) {
    return chip;
  }

  return (
    <Link href={country.href} className={styles.link}>
      {chip}
    </Link>
  );
}
