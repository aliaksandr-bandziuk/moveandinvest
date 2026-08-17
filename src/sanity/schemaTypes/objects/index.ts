import { cta } from "./cta";
import { portableText } from "./portableText";
import { seo } from "./seo";

// linkAnnotation is intentionally absent: it is a factory used inline by
// portableText's marks, not a registered top-level type.
export const objectTypes = [seo, cta, portableText];
