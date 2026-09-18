import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type Messages = Record<string, unknown>;

/** Nested merge, `over` winning. Plain objects only — the catalogues hold
 *  nothing else. */
function merge(base: Messages, over: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const under = out[key];
    out[key] =
      value && typeof value === "object" && under && typeof under === "object"
        ? merge(under as Messages, value as Messages)
        : value;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`))
    .default as Messages;

  // uk IS A SECTION, NOT A SITE (see RouteLocale in ./routing), so its
  // catalogue holds only what a Ukrainian page actually shows: the chrome, the
  // entry labels and the residence form. It is laid over the Russian one, so a
  // key it does not carry reads in Russian — the language of every page the
  // chrome links to from there — rather than throwing MISSING_MESSAGE.
  if (locale === "uk") {
    const ru = (await import("../../messages/ru.json")).default as Messages;
    return { locale, messages: merge(ru, messages) };
  }

  return { locale, messages };
});
