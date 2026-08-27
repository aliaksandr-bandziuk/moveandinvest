import { PortableText } from "next-sanity";
import { buildArticleComponents } from "./articleComponents";
import { ArticleToc } from "../ArticleToc/ArticleToc";
import { extractHeadings, headingIds } from "@/lib/headings";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa6";
import { AUTHOR, type AuthorCopy } from "@/lib/author";
import { Link } from "@/i18n/navigation";
import type { EntryCountry } from "@/sanity/types";

import styles from "./ArticleBody.module.scss";

export interface ArticleBodyLabels {
  published: string;
  updated: string;
  readingTime: string;
  sourcesLabel: string;
  jurisdictionsLabel: string;
  backToIndex: string;
  /** The contents list's own heading, and its accessible name. */
  contents: string;
  /** Who wrote it: the byline prefix, the role, the closing line, the link. */
  author: AuthorCopy;
  /** Section key → its name on /sources, in the reader's language. */
  sectionNames: Record<string, string>;
}

interface ArticleBodyProps {
  /** The reader-facing category name, already resolved for this locale. */
  category?: string | undefined;
  title: string;
  standfirst: string;
  publishedAt: string;
  updatedAt: string;
  countries?: EntryCountry[] | null;
  /** Keys into SOURCE_SECTIONS. Never empty — the schema requires one. */
  sources: string[];
  body: unknown;
  labels: ArticleBodyLabels;
  formatDate: (iso: string) => string;
}

// One entry. Head, prose, and the line that makes this section different from
// a company blog.
//
// TWO DATES, AND ONLY WHEN THEY DIFFER. Published is what the entry claims to
// be true as of; updated is when it was last touched. Showing both
// unconditionally would put "Published 3 March / Updated 3 March" on every
// fresh entry, which teaches a reader to ignore the line — and the line is the
// one this site cannot afford to have ignored, because a threshold that moved
// in between is exactly what it exists to catch.
//
// THE SOURCES LINE IS UNDER THE STANDFIRST, NOT AT THE FOOT. A reader deciding
// whether to trust a figure decides before reading it, not after; burying the
// evidence below a thousand words puts it where only someone already convinced
// will look. Same placement, same reasoning, as the source link under a FAQ
// answer.
/** Which glyph draws which network. Kept here and not in lib/author.ts: that
 *  module is imported by the JSON-LD builder, and a React component reaching
 *  into it would put rendering in a data file. A network with no entry here
 *  renders as its label alone, which is a link that still works. */
const PROFILE_ICONS: Record<string, typeof FaLinkedinIn | undefined> = {
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
};

export function ArticleBody({
  category,
  title,
  standfirst,
  publishedAt,
  updatedAt,
  countries,
  sources,
  body,
  labels,
  formatDate,
}: ArticleBodyProps) {
  const revised = updatedAt.slice(0, 10) !== publishedAt.slice(0, 10);
  const headings = extractHeadings(body);
  const components = buildArticleComponents(headingIds(headings));

  return (
    <article className={styles.article}>
      {/* Fixed across the top of the viewport; see the module for why it is
          here rather than at the end of the markup. */}
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} />
      </div>

      <div className={styles.layout}>
        <header className={styles.head}>
          <p className={styles.meta}>
            <span>
              {labels.published}{" "}
              <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            </span>
            {revised ? (
              <span>
                {labels.updated}{" "}
                <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
              </span>
            ) : null}
            <span>{labels.readingTime}</span>
          </p>

          {/* ABOVE THE TITLE, not beside the date. The category answers "is this
            for me" before the headline does, which is the same job the eyebrow
            does on every other section of this site. */}
          {category ? <p className={styles.category}>{category}</p> : null}

          <h1 className={styles.title}>{title}</h1>
          <p className={styles.standfirst}>{standfirst}</p>

          <p className={styles.sources}>
            <span className={styles.sourcesLabel}>{labels.sourcesLabel}</span>{" "}
            {sources.map((key, index) => (
              <span key={key}>
                {index > 0 ? <span aria-hidden="true"> · </span> : null}
                <Link
                  href={{ pathname: "/sources", hash: key }}
                  className={styles.sourceLink}
                >
                  {labels.sectionNames[key] ?? key}
                </Link>
              </span>
            ))}
          </p>

          {countries && countries.length > 0 ? (
            <p className={styles.countries}>
              <span className={styles.countriesLabel}>
                {labels.jurisdictionsLabel}
              </span>{" "}
              {countries.map((country) => country.name).join(" · ")}
            </p>
          ) : null}
        </header>

        {/* AFTER THE HEAD IN THE MARKUP, in the left margin at lg. Below lg
            this is the closed contents disclosure, and it belongs between the
            standfirst and the first paragraph rather than above the title;
            grid placement puts it back in column one on a wide screen, where
            source order does not decide position. */}
        <div className={styles.side}>
          <ArticleToc headings={headings} label={labels.contents} />
        </div>

        {/* The progress bar's timeline source: the block whose top and bottom
            edges define "read from the beginning to the end". */}
        <div className={styles.body}>
          <div className={styles.prose}>
            <PortableText value={body as never} components={components} />
          </div>

          {/* AT THE END, WHERE A READER WHO FINISHED IS. No portrait: there
              isn't one yet, and a placeholder circle says less than nothing.
              What the block carries instead is the one claim worth making at
              the foot of three thousand words about thresholds — that somebody
              checked them against the law, and here is where that is
              explained. */}
          <aside className={styles.author}>
            {/* The name and the profiles on one line: the profiles are part of
                identifying the person, not a footer under the paragraph about
                him. Underneath, they read as a call to follow; beside the name
                they read as where else this name is. */}
            <div className={styles.authorHead}>
              <p className={styles.authorName}>{AUTHOR.name}</p>

              {/* ICON PLUS A NAME FOR THE ACCESSIBILITY TREE. An icon-only link
                  is a link a screen reader announces as nothing, and these two
                  glyphs are the whole content of the control. `aria-hidden` on
                  the glyph and a visually-hidden label beside it gives one
                  readable name rather than two. */}
              <p className={styles.authorProfiles}>
                {AUTHOR.profiles.map((profile) => {
                  const Icon = PROFILE_ICONS[profile.network];
                  return (
                    <a
                      key={profile.network}
                      href={profile.href}
                      className={styles.profileLink}
                      target="_blank"
                      rel="me noopener noreferrer"
                    >
                      {Icon ? (
                        <Icon aria-hidden="true" focusable="false" />
                      ) : null}
                      <span className={Icon ? styles.profileName : undefined}>
                        {profile.label}
                      </span>
                    </a>
                  );
                })}
              </p>
            </div>

            <p className={styles.authorRole}>{labels.author.role}</p>
            <p className={styles.authorLine}>{labels.author.line}</p>
            <p className={styles.authorMore}>
              <Link href="/about" className={styles.authorLink}>
                {labels.author.more}
              </Link>
            </p>
          </aside>

          <p className={styles.back}>
            <Link href="/blog" className={styles.backLink}>
              {labels.backToIndex}
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
