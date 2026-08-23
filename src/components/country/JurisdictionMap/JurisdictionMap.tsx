import { Reveal, SectionHead } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { CountryRow } from "../types";
import styles from "./JurisdictionMap.module.scss";
import {
  MAP_BASE_PATHS,
  MAP_CENTROIDS,
  MAP_COUNTRY_PATHS,
  MAP_VIEWBOX,
} from "./mapGeometry";

/** Where a jurisdiction's annotation sits relative to its own centroid, in
 *  viewBox units, and which side of the leader line the text hangs from.
 *
 *  Hand-placed rather than computed: five labels on one map is a layout, not
 *  an algorithm, and an automatic placer would spend a lot of code to arrive
 *  somewhere worse. Verified by measuring the rendered boxes for overlap —
 *  Cyprus and the UAE sit on almost the same latitude and collided on the
 *  first pass. */
const ANNOTATION_PLACEMENT: Record<
  string,
  { dx: number; dy: number; align: "left" | "right" }
> = {
  pt: { dx: -40, dy: -70, align: "right" },
  gr: { dx: 26, dy: -96, align: "left" },
  mt: { dx: -30, dy: 74, align: "right" },
  cy: { dx: 34, dy: -52, align: "left" },
  ae: { dx: -34, dy: 126, align: "right" },
};

interface JurisdictionMapProps {
  eyebrow: string;
  index: string;
  heading: string;
  intro?: string;
  rows: CountryRow[];
  /** Rendered under the map. Simplified geometry needs saying out loud. */
  note: string;
  fromLabel: string;
  permitLabel: string;
}

// Full-bleed, on the black plane, with the annotations sitting on the map
// itself from lg up and collapsing into a list below it on a phone — there is
// nowhere to put five labels at 390px, and shrinking them until they fit is
// how a map becomes unreadable.
//
// COLOUR IS NOT AN IDENTITY SYSTEM HERE, and that is deliberate. Five
// categorical hues cannot survive colour-vision deficiency at one lightness —
// a directed search over OKLCH hue sets could not clear the CVD threshold for
// any five, which is a known limit, not a failure of taste. So every covered
// jurisdiction takes the same accent, uncovered land is one flat grey, and
// identity is carried by position and by a direct label. That is stronger
// design and it is accessible by construction.
export function JurisdictionMap({
  eyebrow,
  index,
  heading,
  intro,
  rows,
  note,
  fromLabel,
  permitLabel,
}: JurisdictionMapProps) {
  const drawable = rows.filter((row) => MAP_COUNTRY_PATHS[row.code]);

  return (
    <section className={styles.section} id="jurisdictions">
      <div className={`container ${styles.head}`}>
        <Reveal>
          <SectionHead
            index={index}
            eyebrow={eyebrow}
            heading={heading}
            intro={intro}
            tone="onDark"
          />
        </Reveal>
      </div>

      <div className={styles.stage}>
        <svg
          className={styles.map}
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          role="img"
          aria-label={heading}
        >
          <g className={styles.base}>
            {MAP_BASE_PATHS.map((d) => (
              <path key={d.slice(0, 24)} d={d} />
            ))}
          </g>
          {drawable.map((row) => (
            <path
              key={row.code}
              className={styles.shape}
              data-status={row.status}
              d={MAP_COUNTRY_PATHS[row.code]}
            />
          ))}
          <g className={styles.leads}>
            {drawable.map((row) => {
              const centroid = MAP_CENTROIDS[row.code];
              const place = ANNOTATION_PLACEMENT[row.code];
              if (!centroid || !place) return null;
              const [cx, cy] = centroid;
              return (
                <g key={row.code}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx + place.dx}
                    y2={cy + place.dy}
                  />
                  <circle cx={cx} cy={cy} r={3} />
                </g>
              );
            })}
          </g>
        </svg>

        {drawable.map((row) => {
          const centroid = MAP_CENTROIDS[row.code];
          const place = ANNOTATION_PLACEMENT[row.code];
          if (!centroid || !place) return null;
          const left = ((centroid[0] + place.dx) / MAP_VIEWBOX.width) * 100;
          const top = ((centroid[1] + place.dy) / MAP_VIEWBOX.height) * 100;

          return (
            <figure
              key={row.code}
              className={styles.annotation}
              data-align={place.align}
              data-status={row.status}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <figcaption className={styles.annotationName}>
                {row.href ? <Link href={row.href}>{row.name}</Link> : row.name}
              </figcaption>
              <p className={styles.annotationFigures}>
                <span data-figure>{row.minimumInvestment}</span> ·{" "}
                <span data-figure>{row.timeToPermit}</span>
              </p>
            </figure>
          );
        })}
      </div>

      <div className="container">
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={row.id} className={styles.listItem} data-status={row.status}>
              <span className={styles.mark} aria-hidden="true" />
              <span className={styles.listName}>
                {row.href ? <Link href={row.href}>{row.name}</Link> : row.name}
              </span>
              <span className={styles.listFigures}>
                <span className={styles.listLabel}>{fromLabel}</span>
                <span data-figure>{row.minimumInvestment}</span>
                <span className={styles.listLabel}>{permitLabel}</span>
                <span data-figure>{row.timeToPermit}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>{note}</p>
      </div>
    </section>
  );
}
