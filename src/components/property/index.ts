// The buying half of each jurisdiction. Its own folder rather than a file in
// `country/`, because the two page types answer different questions for
// different readers and share nothing but a `country` reference — and because
// a barrel that exports both would invite a component from one to import from
// the other, which is the dependency direction this project forbids.
export { PropertyArticle, type PropertySection } from "./PropertyArticle";
export { PropertyBrief, type PropertyBriefLabels } from "./PropertyBrief";
