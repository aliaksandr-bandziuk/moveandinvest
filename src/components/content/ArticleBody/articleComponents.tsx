import Image from "next/image";
import type { PortableTextComponents } from "next-sanity";
import type { Image as SanityImage } from "sanity";
import { imageDimensions, urlFor } from "@/sanity/image";
import { FaqAccordion } from "../FaqAccordion/FaqAccordion";

import styles from "./ArticleBody.module.scss";

interface FaqValue {
  _key?: string;
  items?: { _key: string; question?: string; answer?: string }[];
}

interface TableValue {
  caption?: string;
  rows?: { _key: string; cells?: string[] }[];
}

/** The image block as the schema stores it. `SanityImage` rather than a
 *  hand-written asset shape: urlFor and imageDimensions both take the real
 *  type, and a looser local one only moves the mismatch to the call site. */
type ImageValue = SanityImage & { alt?: string; caption?: string };

// What an article body renders beyond paragraphs and headings.
//
// PASSED IN RATHER THAN DEFAULTED. `<PortableText value={body} />` with no
// components renders a table block as nothing at all — silently, with no error
// and no gap in the page. An article whose five tables vanish still looks like
// an article, which is exactly the kind of failure that ships.
//
// The table is the reason this file exists; the image and link overrides come
// with it because the same silent-nothing applies to a figure with no renderer.
export function buildArticleComponents(
  headingIds: Record<string, string>,
): PortableTextComponents {
  return {
    block: {
      // THE ID COMES FROM A MAP, not from slugifying the text a second time here.
      // Two slugifiers drift: the contents list would link to #chastye-voprosy
      // and the heading would carry #chastye-voprosy-2 the day two headings
      // collide, and nothing would fail — the link would just scroll nowhere.
      h2: ({ value, children }) => (
        <h2 id={headingIds[value?._key ?? ""]}>{children}</h2>
      ),
      h3: ({ value, children }) => (
        <h3 id={headingIds[value?._key ?? ""]}>{children}</h3>
      ),
    },

    types: {
      table: ({ value }: { value: TableValue }) => {
        const rows = value.rows ?? [];
        const [header, ...body] = rows;
        if (!header) return null;

        return (
          <figure className={styles.tableFigure}>
            {value.caption ? (
              <figcaption className={styles.tableCaption}>
                {value.caption}
              </figcaption>
            ) : null}

            {/* SCROLLS INSIDE ITS OWN BOX. A six-column comparison cannot shrink
              to 390px and stay readable, and the alternative — letting it push
              the page wider — breaks every other block on the page rather than
              just this one. `tabindex` because a scrollable region has to be
              reachable by keyboard, which a plain overflow container is not. */}
            <div className={styles.tableScroll} tabIndex={0} role="region">
              <table className={styles.table}>
                <thead>
                  <tr>
                    {(header.cells ?? []).map((cell, i) => (
                      <th key={i} scope="col">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row) => (
                    <tr key={row._key}>
                      {(row.cells ?? []).map((cell, i) =>
                        // The first cell of a row names the thing the rest of the
                        // row is about, so it is a header for that row. Without
                        // this a screen reader reads six values with no subject.
                        i === 0 ? (
                          <th key={i} scope="row">
                            {cell}
                          </th>
                        ) : (
                          <td key={i}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        );
      },

      // THE SAME ACCORDION /faq USES, not a second one. Native <details>, so a
      // closed answer is still in the document and still found by find-in-page —
      // see FaqAccordion for why that mattered enough to build it without React.
      //
      // `name` groups the rows so opening one closes the last. Keyed to the
      // block, not to a constant: two question sets in one entry are two groups,
      // and a shared name would make the second set close the first.
      faq: ({ value }: { value: FaqValue }) => {
        const items = (value.items ?? []).filter(
          (item) => item.question && item.answer,
        );
        if (items.length === 0) return null;

        return (
          <div className={styles.faq}>
            <FaqAccordion
              groupName={`faq-${value._key ?? "entry"}`}
              items={items.map((item) => ({
                key: item._key,
                question: item.question ?? "",
                answer: item.answer ?? "",
              }))}
              // The entry cites its sections once, under the standfirst. Nothing
              // here needs the labels, and passing empty ones says so.
              labels={{ sourcesLabel: "", sectionNames: {} }}
              startIndex={0}
            />
          </div>
        );
      },

      image: ({ value }: { value: ImageValue }) => {
        const size = imageDimensions(value);
        if (!size) return null;

        // A VECTOR FIGURE IS SERVED AS ITSELF. The diagrams in these entries are
        // SVG with 12px labels, and the raster path put them through two
        // resamples — Sanity to a fixed width, then next/image to a srcset
        // width that did not match it, at one point UPSCALING 1600 to 1920.
        // Measured on the same crop at the size the figure occupies, mean
        // absolute Laplacian: 6.29 through that chain against 7.15 for the file
        // itself, and the gap widens on a denser screen, where a vector costs
        // nothing more and a raster runs out of pixels.
        //
        // Plain <img>, not next/image, so `dangerouslyAllowSVG` is not needed:
        // that flag exists because next/image would pass the file through its
        // own optimiser and re-serve it from this origin. An <img> never runs
        // script in an SVG, whatever the SVG contains — that is the format's
        // own rule, not a setting.
        //
        // The fonts are inside the file. See scripts/figures/embed.mjs: an
        // <img> loads its SVG as an isolated document that the page's
        // stylesheet and webfonts cannot reach, so naming Inter and hoping gets
        // a fallback that looks almost right.
        const vector = value.asset?._ref?.endsWith("-svg");

        return (
          <figure className={styles.imageFigure}>
            {vector ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlFor(value).url()}
                alt={value.alt ?? ""}
                width={size.width}
                height={size.height}
                loading="lazy"
                decoding="async"
                className={styles.image}
              />
            ) : (
              <Image
                src={urlFor(value).width(2000).quality(90).auto("format").url()}
                alt={value.alt ?? ""}
                width={size.width}
                height={size.height}
                sizes="(min-width: 66rem) 42rem, 100vw"
                quality={90}
                className={styles.image}
              />
            )}
            {value.caption ? (
              <figcaption className={styles.imageCaption}>
                {value.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      },
    },

    marks: {
      // The schema's linkAnnotation. External links get the pair that belongs on
      // them; an internal one gets neither, because rel="noopener" on a same-site
      // link is noise.
      link: ({ value, children }) => {
        const href = String(value?.href ?? "");
        const external = /^https?:/.test(href);
        return (
          <a
            href={href}
            className={styles.bodyLink}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {children}
          </a>
        );
      },
    },
  };
}
