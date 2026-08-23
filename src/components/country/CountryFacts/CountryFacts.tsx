import styles from "./CountryFacts.module.scss";

export interface Fact {
  label: string;
  value: string;
}

// The four figures the comparison table shows in its columns, for one
// jurisdiction, immediately under the hero.
//
// The labels are NOT written here or in a message catalogue — they come from
// the home page's own table column labels, fetched by the route. The strip and
// the table show the same four things, and two places naming the same figure
// are two places that eventually name it differently.
//
// A fact with no value is dropped rather than rendered as an em dash. On the
// table an em dash is meaningful — it says "this jurisdiction is listed and we
// have not checked this figure". On the jurisdiction's own page there is
// nothing to line it up against, so a dash is just a gap with a label on it.
export function CountryFacts({ facts }: { facts: Fact[] }) {
  const filled = facts.filter((fact) => fact.value.trim() !== "");
  if (filled.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <dl className={styles.list}>
          {filled.map((fact) => (
            <div key={fact.label} className={styles.item}>
              <dt className={styles.label}>{fact.label}</dt>
              <dd className={styles.value}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
