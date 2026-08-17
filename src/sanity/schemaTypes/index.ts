import { documentTypes, enquiry } from "./documents";
import { objectTypes } from "./objects";

export const schemaTypes = [...objectTypes, ...documentTypes];

// The schema for the private enquiries dataset. One type, no objects:
// nothing else belongs in a dataset that holds personal data. Not wired into
// a Studio workspace yet — see the comment at the top of sanity.config.ts.
export const enquirySchemaTypes = [enquiry];
