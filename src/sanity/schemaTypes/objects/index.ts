import { cta } from "./cta";
import { faq } from "./faq";
import { portableText } from "./portableText";
import { seo } from "./seo";
import { table } from "./table";

// linkAnnotation is intentionally absent: it is a factory used inline by
// portableText's marks, not a registered top-level type.
export const objectTypes = [seo, cta, table, faq, portableText];
