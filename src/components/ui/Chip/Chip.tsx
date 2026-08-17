import styles from "./Chip.module.scss";

interface ChipProps {
  label: string;
  // Dimmed, non-actionable state. Used for a jurisdiction that is planned
  // but not launched yet.
  muted?: boolean;
  className?: string;
}

// A square plus a label. The square says "covered" or "not covered" and
// nothing else — it no longer encodes which jurisdiction this is, because
// five distinguishable categorical hues do not exist under colour-vision
// deficiency. The text carries identity.
export function Chip({ label, muted = false, className }: ChipProps) {
  const classes = [styles.chip, muted ? styles.muted : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
