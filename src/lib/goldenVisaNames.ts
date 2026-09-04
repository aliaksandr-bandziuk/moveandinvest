import type { Locale } from "@/i18n/routing";
import { tightenDeep } from "./typography";

// WHAT EACH STATE ACTUALLY CALLS THE PERMIT THE MARKET CALLS A GOLDEN VISA.
//
// The table on /golden-visa, and the reason that page can answer "golden
// passport", "golden residency" and "visa by investment" without inventing
// anything: those three are nicknames for a thing that has four different real
// names, and printing the real names beside the nickname IS the answer.
//
// THE SAME FACTS APPEAR AS PROSE IN THE `what-is` ANSWER in faqData.ts, and
// that is a duplication worth naming rather than hiding. It was not merged
// because the two shapes serve different readers: the FAQ answers a question in
// one paragraph, this renders as a table with a column of citations. If a
// state renames its instrument, BOTH have to move in the same commit — the
// same rule this project applies to every figure.
//
// NO CYPRUS ROW. Its regulation 6(2) could not be established from any primary
// source, and this site does not print a name it has not read. A missing row
// here means "not verified", exactly as a dash on /sources does.
export interface GoldenVisaName {
  /** A jurisdiction key from the registry: pt | gr | mt | ae. */
  country: string;
  /** The instrument's own name, in the reader's language. */
  official: Record<Locale, string>;
  /** What the permit runs for before it must be renewed, in the reader's
   *  language. Kept short: the full timeline is on the jurisdiction page. */
  term: Record<Locale, string>;
  /** The /sources section holding the evidence for this row. */
  section: string;
}

const NAMES_RAW: GoldenVisaName[] = [
  {
    country: "pt",
    official: {
      en: "ARI — autorização de residência para investimento",
      ru: "ARI — autorização de residência para investimento",
      pl: "ARI — autorização de residência para investimento",
    },
    term: {
      en: "Two years, then three",
      ru: "Два года, затем три",
      pl: "Dwa lata, potem trzy",
    },
    section: "pt",
  },
  {
    country: "gr",
    official: {
      en: "Residence permit for investment activity",
      ru: "Разрешение на пребывание для инвестиционной деятельности",
      pl: "Zezwolenie na pobyt dla działalności inwestycyjnej",
    },
    term: {
      en: "Five years, renewable",
      ru: "Пять лет с продлением",
      pl: "Pięć lat, odnawialne",
    },
    section: "gr",
  },
  {
    country: "mt",
    official: {
      en: "Permanent residence certificate",
      ru: "Сертификат постоянного резидентства",
      pl: "Certyfikat rezydencji stałej",
    },
    term: {
      en: "Permanent from the outset",
      ru: "Постоянный с самого начала",
      pl: "Stały od początku",
    },
    section: "mt",
  },
  {
    country: "ae",
    official: {
      en: "Ten-year golden residence",
      ru: "Десятилетнее золотое резидентство",
      pl: "Dziesięcioletnia złota rezydencja",
    },
    term: {
      en: "Ten years",
      ru: "Десять лет",
      pl: "Dziesięć lat",
    },
    section: "ae",
  },
];

export const GOLDEN_VISA_NAMES: GoldenVisaName[] = tightenDeep(NAMES_RAW);
