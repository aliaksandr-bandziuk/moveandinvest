import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PortableText } from "next-sanity";
import { SectionHead } from "@/components/ui";

import type { AppHref } from "@/lib/routes";
import styles from "./MethodDocument.module.scss";

export interface MethodSectionContent {
  id: string;
  heading: string;
  /** Portable Text. */
  body: unknown;
}

export interface AuthorBlock {
  label: string;
  note: string;
  name: string;
  /** Legal form and tax number, rendered as one quiet line under the name. */
  identity: string;
  /** Absent when no portrait file exists — see the note below. */
  portrait?: { src: string; alt: string; width: number; height: number } | null;
}

interface MethodDocumentProps {
  eyebrow: string;
  heading: string;
  intro: string;
  sections: MethodSectionContent[];
  /** Rendered inside the section whose id this matches, after its prose.
   *  Today that is the corrections section. */
  authorInSectionId: string;
  author: AuthorBlock;
  /** One link, rendered under the prose of the section it names. It exists for
   *  exactly one job: section 1 claims every figure has a law and a date, and
   *  the page that proves it is /sources. A claim whose evidence is one click
   *  away and unlinked is a claim nobody checks. */
  sectionLink?: { inSectionId: string; href: AppHref; label: string } | null;
}

// The /about page.
//
// A SEPARATE COMPONENT FROM LegalDocument, and the temptation to reuse that one
// is worth answering. The policy is one column of single paragraphs, read top
// to bottom, with a hanging section number a reader can cite. This page is
// scanned: somebody arrives to answer one question — "who are these people and
// who pays them" — and needs to find the one section that answers it. So the
// sections carry sub-headings inside their prose, which the policy's shape
// forbids, and there are no numbers, because "section 03 says" is not a
// sentence anybody will write about this page.
//
// What IS reused is `SectionHead` at level 1 and the narrow container, for the
// same reasons the policy has them: this is the page's only head, and a column
// of prose at 106rem reads as a mistake.
//
// THE AUTHOR BLOCK SITS INSIDE THE CORRECTIONS SECTION, not at the top. Placed
// at the top it is a credential, and this page's whole argument is that
// personal credentials are the weaker kind of authority — it would undercut
// the text three paragraphs above it. Placed under "if you have found an
// error" it is what it actually is: the face of the person who is wrong when a
// figure is wrong. Same reason the identity line carries the legal form and
// the tax number rather than a job title.
//
// A MISSING PORTRAIT IS NOT A BROKEN IMAGE. `portrait` is null when the file
// is not there, and the block renders as text. That is deliberate rather than
// defensive: the site takes no paid stock imagery, so the alternative to a
// real photograph is no photograph, never a placeholder silhouette.
export function MethodDocument({
  eyebrow,
  heading,
  intro,
  sections,
  authorInSectionId,
  author,
  sectionLink = null,
}: MethodDocumentProps) {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead level={1} eyebrow={eyebrow} heading={heading} intro={intro} />

        <div className={styles.list}>
          {sections.map((section) => (
            <section key={section.id} id={section.id} className={styles.item}>
              <h2 className={styles.heading}>{section.heading}</h2>

              {/* The heading and THIS div are the grid's two columns. The
                  author block has to live inside the second one, not beside
                  it: as a third child of the grid it wrapped onto a new row
                  and landed under the sticky heading, in the left track. */}
              <div className={styles.body}>
                <div className={styles.prose}>
                  <PortableText value={section.body as never} />
                </div>

                {sectionLink && section.id === sectionLink.inSectionId ? (
                  <p className={styles.sectionLink}>
                    <Link href={sectionLink.href}>{sectionLink.label}</Link>
                  </p>
                ) : null}

                {section.id === authorInSectionId ? <Author author={author} /> : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function Author({ author }: { author: AuthorBlock }) {
  return (
    <figure className={styles.author}>
      {author.portrait ? (
        <Image
          className={styles.portrait}
          src={author.portrait.src}
          alt={author.portrait.alt}
          width={author.portrait.width}
          height={author.portrait.height}
          // Below the fold on every viewport, so it is not a priority image —
          // and `sizes` is set because the rendered box is far smaller than the
          // source on every breakpoint, which is the difference between
          // shipping a 90KB crop and shipping the whole file.
          sizes="(min-width: 48em) 9rem, 6rem"
        />
      ) : null}

      <figcaption className={styles.authorText}>
        <p className={styles.authorLabel}>{author.label}</p>
        <p className={styles.authorName}>{author.name}</p>
        <p className={styles.authorIdentity} data-figure>
          {author.identity}
        </p>
        <p className={styles.authorNote}>{author.note}</p>
      </figcaption>
    </figure>
  );
}
