import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/i18n/navigation";
import type { CtaHref, ExternalHref } from "@/lib/routes";
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
//
// TWO KINDS OF HREF SINCE THE ROUTES BECAME TYPED, and the union says which is
// which rather than leaving it to a regex at runtime. An internal target is a
// route this site declares; an external one is a full URL or a scheme, and it
// is still a string because nothing here can check it. The narrowing below is
// `typeof href === "string" && isExternal(href)`: a route object is internal by
// construction, so it never reaches the test.
function isExternal(href: string): href is ExternalHref {
  return /^(https?:|mailto:|tel:|#)/.test(href);
}

type ButtonAsLink = CommonProps & { href: CtaHref };
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

    // A route object is internal by construction and never reaches the test;
    // only a string can be either. Written as two narrowing steps rather than
    // one condition so the branch below is left with the internal routes and
    // needs no cast to say so.
    if (typeof href === "string" && isExternal(href)) {
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
