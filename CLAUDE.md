# CLAUDE.md

Conventions for anyone (human or AI) working in this repo. Derived from the
conventions proven on the sibling `giuseppeiannone` project; the sections on
styling, typing, Sanity guardrails and data fetching are deliberately close to
that project's so the two stay learnable as one system.

## What this project is

`moveandinvest.com` — a lead-generation asset. Relocation content is the top of
the funnel, property is the paying floor, five jurisdictions (Portugal, Greece,
Cyprus, Malta, UAE) launched in waves rather than in parallel.

Two consequences that constrain the code, not just the content:

- **The site must not become the project.** The first job of this codebase is to
  make outbound partner emails credible: a landing page and a `/for-partners`
  page. Everything after that is built to confirmed demand.
  *Amended 16 Aug 2026 — the owner has time and wants a proper site, so the
  brief's "minimum site in days" no longer binds. What still binds is the
  sequencing: the emails do not wait for the site to be finished. They waited
  for it to EXIST, and it does.*
- **Qualification stays in-house.** A lead answers the enquiry form's questions —
  jurisdiction, budget, timeline, goal, plus their own words — inside our own
  form before it reaches a partner. Never replace that with a link out to a
  partner's own form: the qualification step is the asset.

## Business decisions already taken

Recorded because they have each been re-litigated once, and because getting them
wrong sends the build in the wrong direction for days.

- **The site never states a price for a lead.** The whole purpose of the first
  outbound wave is to ask the market what it pays for a qualified enquiry and on
  what terms. A page that names a figure destroys the question and anchors low.
  `/for-partners` states what we do and what a lead is; the price is the question,
  not the answer.
- **We collect enquiries and pass them on. We are not an advertising directory.**
  No paid placement, no sponsored listings, no ranking partners. This was
  proposed once and rejected.
- **One partner per jurisdiction; an enquiry is never resold.** This is the
  difference from a lead exchange and belongs in the copy.
- **Legal constraint, from desk research 16 Aug 2026:** paying a lawyer per
  referred client is prohibited in Malta (the Code's "tout" definition covers a
  fixed fee) and criminal in the UAE (Federal Decree-Law 34/2022 Art. 101, which
  binds the platform operator, not only the firm), and doubtful in Cyprus.
  Portugal and Greece are workable. Non-lawyer partners — relocation agencies,
  developers, estate agents — are outside the bar codes entirely. Research, not
  advice; get a local opinion before signing anything in MT/AE/CY.

## Known gaps, against the concept rather than the code

- **No property half of the funnel.** The concept is relocation on top, property
  as the paying floor. Every section built so far addresses the relocator; a
  reader who has chosen a country and wants to look at property has nowhere to go.
- **No audience capture.** The brief names owning the audience as the second
  defence against partner dependency. Today the only way to give us an email is
  to submit a full enquiry with consent to be passed on — a reader who is not
  ready yet leaves no trace.
- **The figures are seeded, not verified.** Costs, timelines and FAQ answers were
  written as orders of magnitude by the build, and say so in their source notes.
  For a site whose entire position is "we publish the real number", one wrong
  threshold checked by a lawyer destroys the premise. Verify before traffic.

## Working process

Stage by stage, one step at a time. Before each step: state what will be done and
why in a few sentences, list the files that will be created or modified, and wait
for an explicit go. After each step: a short diff summary and one conventional
commit (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`). Steps are never bundled.
A dependency is never installed without first naming it and its purpose.

The working tree is authoritative. Never revert or overwrite existing code that
looks intentional without asking — manual edits by the owner are expected.

## Design direction

"Data desk / Oxblood", chosen 15 Aug 2026 after comparing four accents on an
identical shell. The rules that make it that direction rather than a generic
site:

- **The comparison table is the hero element**, not a photograph. This is also an
  AEO decision: structured comparisons are what AI answer engines extract and
  cite. A page that leads with a stock photo of a coastline has nothing to quote.
- **The accent is oxblood (`--color-accent`), and it covers at most ~5% of any
  screen.** Past that it stops reading as editorial and starts reading as an
  alert.
- **No gold, no navy-and-gold, no villa-at-sunset imagery.** That palette is the
  category default — hundreds of golden-visa consultancies already look like it.
- **Radii stay small.** Rounded corners are what turn a data table back into a
  marketing card.
- **Figures render in `--font-mono` with tabular numerals** so columns align
  digit-for-digit. Use the `figure-text` mixin or the `[data-figure]` attribute.
  Figures only — prose set in JetBrains Mono reads as a code sample.

Parked ideas, not rejected ones:

- **"Фраза"** — the interface as one sentence, each underlined phrase a control
  ("У меня €300–500 000, пермит нужен за месяц-два, и важнее всего …"). Lost
  section 05 to the terminal readout because the options hide until tapped, which
  is wrong for a block that has to be crawlable. Kept for a jurisdiction page,
  where the sentence can be a summary rather than the only copy. Render:
  `s05-c-d.png`, 16 Aug 2026.

Budget constraint, permanent: **no paid fonts and no paid imagery.** Google Fonts
and free stock only. Any proposal that depends on a licensed face or a paid photo
library is out of scope before it is evaluated.

## Styling — SCSS Modules, no Tailwind

- Component styles live in a co-located `Component.module.scss` next to
  `Component.tsx`.
- Shared tokens live in `src/styles/_tokens.scss` (CSS custom properties: palette,
  type scale, spacing, radii, plus the compile-time breakpoint and z-index maps)
  and `src/styles/_mixins.scss` (breakpoints, focus rings, eyebrow, figure-text,
  measure, link, grids). `src/app/[locale]/globals.scss` holds the reset, the base
  typography and the one global `.container` class.
- **No raw hex colours and no raw px values** in component styles, except `1px`
  borders. Reference tokens and mixins only.
- Media queries are mobile-first via `mixins.breakpoint-up`, never hand-written
  `@media (min-width: 900px)`.
- Do not add a `container` mixin. The container is a real global class so there is
  exactly one compiled copy sitewide.
- **When a token's value changes, grep every consumer and spot-check each one.**
  A token is a shared contract; changing what it resolves to affects every reader,
  not just the component the change was written for.

## Components — thematic folders

Components are grouped by what they are about, not by what they are made of. Each
folder owns its own barrel (`index.ts`); nothing imports across a folder boundary
by deep path.

```
src/components/
  layout/     Header, Footer, LocaleSwitcher, SkipLink — page chrome
  ui/         Button, Chip, Tag, Card, Table, Dialog — primitives with no
              domain knowledge; nothing here may import from a domain folder
  country/    CountryChip, CountryComparisonTable, CountryFactsStrip,
              CountryNav — everything that knows a jurisdiction exists
  lead/       QualifyForm, QualifyField, ThankYou — the three-question
              qualification flow and nothing else
  partners/   PartnerHero, PartnerTerms, PartnerCta — the /for-partners surface
  content/    PortableText renderers, TableOfContents, ArticleMeta, Prose
  marketing/  Hero, SectionKicker, StatRow, Eyebrow — reusable page furniture
```

Direction of dependency is one-way: `ui/` knows nothing about the domain,
`country/` and `lead/` may use `ui/`, pages may use anything. If a `ui/` primitive
starts needing a jurisdiction prop, it belongs in `country/` instead.

## Typing

- `strict: true` + `noUncheckedIndexedAccess`. Do not weaken these.
- No implicit `any`; avoid explicit `any` — if unavoidable, narrow it immediately
  and comment why.
- GROQ results must have explicit result types. No untyped `client.fetch(...)`.
- Route handlers type their request and response shapes.

## Rendering rule (SEO/AEO/GEO)

All public pages are server-rendered — static generation or ISR via
`revalidateTag`. No client-side fetching of indexable content. Client components
are fine for interactivity (menus, form widgets) but must never be the source of
content that should be crawled or quoted.

The working shape for an interactive block: the server renders **every** state's
content, and a behaviour-only client wrapper toggles attributes over it. See
`RouteFinder` — all five jurisdiction summaries are in the HTML, and the client
hides four. Without JS the block degrades to a complete list, which is a better
crawl target than the interactive state, not a worse one. `CountUp` and `InView`
follow the same rule. A client component that *renders* the content instead is
how indexable text quietly leaves the page.

Radio groups need a real `<form>`. Loose radios with the same `name` group across
the whole document, so two blocks — or one unrelated `name="budget"` — silently
share state. A form with no submit button and no text field never submits, so
this costs nothing.

Form success states go through a **fragment**, never a query parameter. Reading
`searchParams` in a server component makes the whole page dynamic for every
visitor; `#enquiry-sent` plus `:target` costs nothing and keeps the page static.

## Messages that keep their placeholders

`t()` parses every message as ICU. A message written as a TEMPLATE — one whose
`{placeholders}` are filled in later by a client component, from state the
server never sees — throws `FORMATTING_ERROR` the moment it goes through `t()`
without values, and the page renders six red errors instead of six strings.

Read those with `t.raw(key)` instead. `src/app/[locale]/page.tsx` wraps it in a
local `template()` helper; anything handing a `{...}` string across the
server/client boundary must use it. A message that is complete on the server is
still an ordinary `t()` call.

## Links that do not exist yet

A page the site plans but has not written is rendered, marked, and NOT linked —
never hidden, never linked to a 404. The comparison table does it with em
dashes, the footer with a "soon" chip. Footer structure lives in
`src/lib/footerNav.ts`; adding a link is editing that list, and the component
already takes its groups as data, so moving them into Sanity later changes the
source and not the component. Jurisdictions are never listed there — they come
from the registry, so one place decides which five exist.

External credit links carry no `rel="nofollow"`. There is no `rel="follow"` and
no `rel="index"`: followed and indexable is what a link already is. `noopener`
is a security measure and is invisible to crawlers.

## Personal data

The content dataset is PUBLIC. Anyone with the project id can run
`*[_type == "..."]` against it over the API with no credentials. Everything in it
is published on the site anyway — that is the deal.

Therefore: **nothing carrying personal data ever goes in it.** Enquiries live in a
separate dataset that must be created as *private* (`NEXT_PUBLIC_SANITY_ENQUIRIES_DATASET`),
written only by `src/sanity/enquiries.ts`, never read by the front end, and read
by a human through `npm run enquiries`. The `enquiry` schema type is deliberately
absent from `documentTypes` so it cannot be registered in the content workspace
by habit.

The consent checkbox on the enquiry form is required and starts unchecked, and
stays that way. This site's business model is passing enquiries to partners; a
pre-ticked box is not consent under the GDPR, and a missing one makes every
forward unlawful. Deleting an enquiry must stay one click — erasure is a right,
not a support ticket.

## i18n routing

- `en` is the default locale, served unprefixed at `/...`. `ru` at `/ru/...`,
  `pl` at `/pl/...`.
- `next-intl` with `localePrefix: "as-needed"` and `localeDetection: false`.
- The middleware matcher must exclude `/studio`, `/api` and static assets.
- UI chrome strings come from `messages/<locale>.json`. **Page content comes from
  Sanity**, never from the message catalogues.
- One display face across all locales (Spectral covers latin, latin-ext and
  cyrillic). Do not introduce a per-locale font: two faces never share an
  x-height, which forces a separate type scale per locale.

## Sanity schema guardrails

- **Language-neutral facts never live on a translatable document.** The
  `country` type holds the ISO code, chip colour, sort order and status and is not
  registered for translation; `countryPage` holds the translatable copy and
  references it. Duplicating a colour per locale is how Greece ends up two
  different greens.
- Slugs auto-generate from `title` on create and become read-only once the
  document has been published (custom slug input using `useEditState` — schema
  `readOnly` callbacks are synchronous and cannot see publish state).
- Singletons have delete and duplicate document actions removed and are pinned in
  the desk structure.
- Everything that must not be empty carries `validation: Rule.required()`.
- Portable Text is restricted per content type. Do not add marks, styles or blocks
  beyond what is explicitly allowed without revisiting this rule on purpose.
- Translation pairs use `@sanity/document-internationalization`. Do not invent an
  ad hoc parallel-field scheme.
- Studio UI language is English regardless of site locale.

## Sanity data fetching

Every content fetch goes through `src/sanity/client.ts`. Never call
`client.fetch(...)` from a page, route or component. Two wrappers, both with tags
as a **required** argument — an untagged fetch is one the revalidation webhook can
never invalidate:

- `sanityFetch(query, params, tags)` — draft-mode aware, for request-time page and
  metadata fetches.
- `sanityFetchPublished(query, params, tags)` — always published. Use for
  `generateStaticParams` (build time, no request exists) and for `sitemap.ts` /
  `robots.ts`, which must never reflect a visitor's own draft-mode cookie.

## Package manager

npm only. Commit `package-lock.json`.

## Commit conventions

Conventional commits, one focused commit per approved step, imperative present
tense subject.
