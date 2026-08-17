import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/i18n/navigation";
import styles from "./Button.module.scss";

type Variant = "primary" | "ghost";
/** Which plane the button sits on. The black plane needs its own borders and
 *  focus ring — the oxblood accent is 1.92:1 there and disappears. */
type Tone = "onLight" | "onDark";

interface CommonProps {
  variant?: Variant;
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

// An external destination gets a plain <a>; an internal one goes through
// next-intl's Link so the locale prefix is added automatically.
function isExternal(href: string) {
  return /^(https?:|mailto:|tel:|#)/.test(href);
}

type ButtonAsLink = CommonProps & { href: string };
type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
    href?: undefined;
  };

export function Button({
  variant = "primary",
  tone = "onLight",
  children,
  className,
  ...rest
}: ButtonAsLink | ButtonAsButton) {
  const classes = [styles.button, styles[variant], styles[tone], className]
    .filter(Boolean)
    .join(" ");

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest;

    if (isExternal(href)) {
      return (
        <a href={href} className={classes} {...anchorRest}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as Omit<ButtonAsButton, keyof CommonProps | "href">;

  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
