import styles from "./Eyebrow.module.scss";

interface EyebrowProps {
  children: React.ReactNode;
  // Accent colour is the default. `plain` renders it in muted grey, for
  // places where an accent-coloured line would push past the ~5% budget
  // the direction allows.
  tone?: "accent" | "plain";
  className?: string;
}

// The small uppercase line above a heading. Shares its exact typography
// with table column headers by construction — both come from the `eyebrow`
// mixin — because the tables are the visual centrepiece and every other
// micro-label on the site should echo them.
export function Eyebrow({ children, tone = "accent", className }: EyebrowProps) {
  const classes = [styles.eyebrow, styles[tone], className]
    .filter(Boolean)
    .join(" ");

  return <p className={classes}>{children}</p>;
}
