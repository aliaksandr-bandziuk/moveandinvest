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

- **The site never states a price for a lead, and no longer states a payment
  model either.** The whole purpose of the first outbound wave is to ask the
  market what it pays for a qualified enquiry and on what terms. A page that
  names a figure destroys the question and anchors low; a page that names the
  MODEL ("paid per qualified lead") does the same thing one level up, and is
  additionally wrong for two of the five jurisdictions — see the legal
  constraint below. What the copy states instead is what an enquiry is, who
  receives it, and what we do NOT do: one partner per jurisdiction, no resale,
  no commission on a closing. The home page's method block used to state the
  model in its fourth point; it now says what we do NOT do instead — no
  property sales, no percentage of a transaction, no paid position in the
  table.
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
- ~~No audience capture.~~ **Closed 24 Aug 2026** by the change list — see
  "The change list" below. What is still missing is the second half of it: a
  way to SEND to that list. The addresses arrive in a mailbox, and there is no
  email service behind them.
- ~~The figures are seeded, not verified.~~ **Verified 23 August 2026** against
  statutes, ministry tariffs and official fee schedules; the working, with a
  source and a date per figure, is `docs/figures-verification-2026-08-23.md`.
  Five of the six headline numbers were wrong — Greece was on a threshold
  superseded in September 2024, Malta on one superseded in January 2025, the
  UAE on a stale exchange rate, and Portugal's five-year naturalisation had
  become seven or ten in May 2026. Re-check on any rule change; the figures
  themselves live in `scripts/copy/jurisdictions.ts` and `scripts/copy/faq.ts`,
  shared by `seed.ts` and `facts.ts` so a correction reaches both an empty
  dataset and documents that are already published. **A number may not change
  in those files without the verification document changing in the same
  commit.**

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

## The section head is a spread, and the deck is a paragraph

Fixed 23 Aug 2026 after the page was rebuilt section by section and still read as
broken. The root cause was one decision and its consequences: **the container was
widened to `106rem` and the extra width was never given a job.** Every section
capped something to a measure and left the rest of the field empty, so each block
looked like a narrow column pushed right by an offset with no visible cause. Six
separate "fix this section" patches were treating the same fault six times.

The rules that came out of it:

- **`SectionHead` is a two-column spread from `lg` up** — number, eyebrow and
  title left, deck right, `6fr / 5fr`, the two together holding the full
  container. Not half and half: the title is set three times the size of the deck
  and needs fewer characters per line. Below `lg` it is one column in reading
  order. Sections that lay out their own body should inherit the same 6/5 split
  rather than invent a grid, so the head and the body share one rhythm.
- **`intro` is a DECK, not a caption.** Four to seven lines, 340–405 characters,
  a real paragraph. The Sanity field is titled "Deck" and its description says so.
  A section whose deck is one clause will look emptier in this layout than it did
  in the old single column — that is the layout obliging the copy, not a bug to
  patch with a width cap.
- **The section number must be legible.** It was shipped at 1.13:1 on the black
  plane and 1.32:1 on white, which is the contrast of a hairline: readers do not
  see a number, they see the heading mysteriously offset and conclude the layout
  broke. `--color-section-number` and `--color-section-number-on-dark` carry their
  measured ratios (2.31:1 and 2.13:1) in a comment beside them. If either value
  changes, re-measure and rewrite the comment.
- **Do not cap the heading from `lg` up.** A `15ch` cap left a 420px gutter
  between title and deck — the same empty field the spread exists to remove, just
  moved to the middle. The column *is* the measure.

## Motion

Motion earns its place by carrying data, never by decorating. Three animations
ship: the hero accent rule draws left to right, the cost bars in section 04 grow
from the left with the extras segment delayed, and the five country outlines in
section 05 draw in sequence and then fill.

Three rules, all of which were learned by getting them wrong first:

- **Gate on `InView`, not on load.** An animation written in the base rule runs
  the moment the document parses and finishes several screens before anyone
  scrolls to it. `InView` sets `data-js`/`data-inview` on a wrapper; the animation
  belongs under `[data-js="on"][data-inview="true"]`.
- **The finished state is the resting state in the cascade.** The pre-animation
  state lives under `[data-js="on"]`, so a crawler, a failed bundle or a reader
  with `prefers-reduced-motion: reduce` gets the complete graphic, not an empty
  one. Every motion rule sits inside `@media (prefers-reduced-motion: no-preference)`.
- **Path length ships as data.** `stroke-dasharray`/`stroke-dashoffset` need the
  length; `getTotalLength()` needs JS and a layout pass. The generator computes it
  and emits `len`, and the component passes it as a `--len` custom property.

## Jurisdiction colour

Four identity hues — `#22a894` PT, `#5a7fe0` GR, `#cf7a1e` MT, `#c4517f` AE — run
through the dataviz skill's `validate_palette.js` against both surfaces, for
adjacent-pair CVD separation and the normal-vision floor. Cyprus is deliberately
muted: it is not launched, and giving it a hue makes it look launched.

**`accentColor` on the `country` document is deliberately not read by the front
end.** It exists so an editor can tint a chip, and it will happily produce two
different greens and a pair no deuteranope can tell apart. Colour that carries
identity is code, validated once; if a fifth hue is ever needed, extend the
palette and re-run the validator rather than reading the field.

## Generated geometry

`scripts/geo/outlines.mjs` regenerates `src/components/country/JurisdictionCards/countryOutlines.ts`
— per-country SVG paths from Natural Earth 1:10m via `world-atlas`, projected
individually, simplified with Ramer–Douglas–Peucker **in screen space** (0.4px),
and emitted with a `viewBox` and a path `len`.

- Simplify in screen space, not in degrees. A global tolerance at 1:50m turned
  Malta into a four-vertex lump while Portugal was still fine.
- **Its dependencies (`world-atlas`, `topojson-client`, `d3-geo`) are deliberately
  NOT in `package.json`.** The script runs once every few months by hand; the
  output is committed. Three packages in `devDependencies` that no build step
  touches are three packages every `npm ci` installs and every audit reports.
  Install them ad hoc when regenerating.

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
- **Vertical rhythm comes from one mixin.** `section-rhythm` sets the block
  padding every numbered section uses. Hand-written `padding-block` on a section
  is how eleven sections end up with nine spacings.
- **Anything tappable uses `tap-target`** — `inline-flex` plus a `2.75rem`
  minimum block size. A 14px-tall text link inside a paragraph is not a target on
  a phone.

Two traps, both of which cost an hour here:

- **Sass splits the parent rule around a nested at-rule.** A
  `@include breakpoint-up(lg) { … }` block written in the MIDDLE of a rule
  compiles to three rules in source order, and a plain declaration written after
  it wins over the media block at every width. Put nested media queries at the END
  of the rule they belong to.
- **CSS Modules do not protect against a collision inside one file.** Two
  unrelated things named `.big` in the same stylesheet — a list and its cards —
  hash to the same class and both get every declaration. Name by role
  (`.gridThree` for the list, `.wide` for the card modifier), not by size.

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

## Measuring a render: scrollWidth lies here

`globals.scss` sets `overflow-x: clip` on html and body. That clamps
`document.documentElement.scrollWidth`, so the usual `scrollWidth > innerWidth`
overflow test reports "none" on a layout that is genuinely too wide — the
offending element is simply clipped out of view. Any harness checking for
horizontal overflow has to walk element bounding boxes and compare `right`
against `innerWidth`. The clip is deliberate and stays (it is what stops html
and body becoming two independent scroll containers); the test is what changes.

## A fixture may not improve on the response it stands in for

The render harness (`/tmp/mi-render`, a copy of this repo whose
`src/sanity/client.ts` answers every `sanityFetch` from `scripts/copy/`) exists
because the cloud container cannot reach api.sanity.io. It is only worth having
while its answers have the SAME SHAPE as the real ones, including their gaps.

It broke that rule once, and the cost was six months of a visible defect. The
fixture held a per-locale country name; the real query read the registry's
single English `name`. So every measurement in the harness showed "Греция"
while production showed "Greece" — on the comparison table, the cards, the map,
the route finder, the footer and every heading on the jurisdiction page.
Nothing in the type system could see it: both sides were `string`.

Two rules follow. A fixture models the query, fallbacks and empty fields
included — `readName` in that file mirrors the GROQ `select`/`coalesce` line
for line, and if a language has no label the fixture must show the fallback,
not the nice answer. And a GROQ change is checked against **groq-js**, which is
already in `node_modules`: parse the exported query string, evaluate it over a
handful of hand-written documents, and read the output. That is a measurement
of the real query text, not of a JavaScript imitation of it, and it takes about
a minute:

```
node -e "const {parse,evaluate}=require('groq-js'); …"
```

Both the localized name and its fallback were verified that way before the
schema field was written.

## Jurisdiction names: `name` is English, `label` is what a reader sees

`country.name` is the registry's English name — Studio lists, and the fallback.
`country.label` is an object of three strings and is what every component
renders, resolved per locale in GROQ (`select` on `$locale`, `coalesce` back to
`name`) rather than in six components.

The label lives on the language-neutral `country` document, which is the one
exception to that document's own rule, and Cyprus is the reason: it is
`planned`, has no page in any language, and still appears in the table, on the
map and in the footer — all driven from the registry precisely so a
jurisdiction without a page cannot be dropped. A label on the page is a label
Cyprus cannot have.

The English label takes the short form where the site's prose does — "UAE",
not "United Arab Emirates" — because the body copy says "the UAE" in every
paragraph around the table.

`npm run facts -- --write` writes the labels; `seed` cannot, since these
documents were published long ago.

## Enquiry email: the email IS the record

`/api/enquiry` calls `src/lib/enquiry/sender.ts` and `storeEnquiry`, and
**neither one is privileged.** An enquiry counts as delivered if either
channel accepted it; the visitor sees an error only when both refused, and
then the route prints the whole payload to the log, because at that point the
log is the last copy in existence. Which half carried it is logged every time:
"we have the enquiry" and "we have it in two places" are different facts.

This replaced a store-then-notify design in which the dataset was the source
of truth and a failed send was swallowed. That was right while a private
dataset was assumed; it is wrong now that there isn't one, and leaving it
would have meant a silent SMTP failure losing an enquiry with nothing said to
anybody.

The architecture is ported from the sibling `giuseppeiannone` project's
`src/lib/contact/sender.ts` — configuration guard that names the missing
variables (names, never values), no development stub that fakes success,
internal notification always in one language, the visitor's confirmation
second and in its own swallowed try/catch, `replyTo` on the person who wrote,
and nothing from the visitor's own text in any log line on any path. Two
things from that project are deliberately NOT here:

- **Its 503 on a failed send.** There, email IS the storage, so a failed send
  loses the message and the visitor must be told. Here it does not.
- **Its signed form token.** It requires the client to fetch a token on mount,
  which means it requires JavaScript, and this form has to work without it.
  The honeypot and the per-IP limit in `rateLimit.ts` both survive JS being
  off, and they are the guard.

SMTP host, port and TLS are constants in `sender.ts`, not environment
variables: they are fixed facts about Hostinger's relay rather than secrets,
and three more variables to keep in sync between `.env.local` and the host is
three more chances for them to disagree. Only `EMAIL_USER` and
`EMAIL_PASSWORD` vary. Both From and To are that one mailbox, through a single
`NOTIFY_RECIPIENT` constant, so repointing notifications later is one edit.

The decode maps at the top of `sender.ts` — budget, timeline, goals — must
stay in step with `ALLOWED` in the route. A value with no entry renders as its
raw form rather than vanishing, which is legible enough to notice.

**The honeypot field is called `q7`, and the name is meaningless on purpose.**
It was `company`, labelled "Company (leave empty)", until 23 August 2026, when
the owner filled in the live form himself and got "Sent." while nothing was
stored and no email was sent: Chrome's address autofill matched `company` to
its `organization` token and filled the trap. Renaming it to something that
still read like a real field would only postpone the same bug — any plausible
name is one some browser, password manager or extension may decide to fill.

Three layers, and the second is the one that does not depend on the name:

1. a name no heuristic can match;
2. `readonly` on the input — a browser will not autofill a readonly field,
   while a script posting the form body directly is unaffected by it;
3. `autocomplete="off"` plus `data-lpignore` and `data-1p-ignore`.

Layer 2 costs a little catch rate: a bot that parses the HTML and skips
readonly inputs will not trip the trap. **That trade is deliberate.** Spam in
the dataset is an annoyance; a silently rejected enquiry is a lost client who
believes they were ignored. When the two conflict, the human wins.

The Sanity field description says not to reword the label to "Company" or
"Organisation" either — label text is itself an autofill signal.

A tripped honeypot answers with the SUCCESS page, because telling a bot which
check it failed is how the next attempt passes. A trip is therefore invisible
by design, which is exactly why the route logs one line on every trip, with
the IP and never the value. Without it the only evidence is a suspiciously
fast response in the request log, which is how this one was caught:
`application-code: 24ms` is too fast to have written to Sanity and opened an
SMTP connection, and that number was the whole diagnosis.

**Two kinds of failure, two fragments.** `#enquiry-error` means the visitor
left out something only they can supply — an address, the consent box.
`#enquiry-failed` means WE broke: the write did not land, or the address was
rate limited. `#partner-error` and `#partner-failed` are the same split on the
other form. There was one panel for both until 23 August 2026, and when the
enquiries dataset turned out to be unconfigured the page told a person who had
filled the form correctly that their email address was missing. Blaming a
visitor for our own outage is how a lead leaves and does not come back, so the
second panel says the fault is ours and gives an address to write to.

`npm run mailcheck` exists for the other half of the question. It connects and
authenticates against the relay and prints the full SMTP dialogue, with
`-- --send` to put a message in your own inbox. It tells apart the four causes
of "an enquiry arrived and an email did not" — variables not loaded, bad
credentials, no route to the relay, delivered but filed as spam — which the
app itself cannot.

**Closed 23 August 2026:** `/privacy`, one path for all three locales,
generated from `scripts/copy/privacy.ts`. Twelve sections, and the fourth is
the one that governs the rest.

**Google Analytics 4 and Microsoft Clarity ship behind a consent gate**
(23 Aug 2026). The rule the whole integration turns on: **no vendor script
tag exists in the DOM until consent is given.** Not Google's Consent Mode,
which loads the tag and reports "denied" — that would make the privacy
policy's own sentence false while looking like compliance from the outside.
`src/lib/consent/consent.ts` is the gate; `runWhenConsented` is the only
sanctioned way to start a gated script, and the loaders create the elements
themselves. A script tag mounted with an internal "if consented" check has
already made its request by the time the check runs.

**The banner and the policy are frozen as of 23 Aug 2026 by the owner's
instruction.** Everything in this section describes what is there and why; none
of it is an outstanding task. The two paragraphs below are the reasoning behind
the current shape, kept so nobody re-derives it — not a proposal to change it.

**The banner has two buttons and always will.** A bar with one OK button is
not consent: consent must be prior and refusing must be as easy as accepting,
so a single button makes leaving the only way to decline. "Only necessary" and
"Accept" are the same size, side by side, the refusal first. There is no
preferences panel because there is one gated category; if advertising tags
arrive, the panel is what grows, not the button count. The footer carries a
control that reopens the banner — without it "withdraw at any time" is a
sentence with nothing behind it.

**It is an oxblood CARD in the lower left, not a strip along the bottom, and
it is the only element allowed to break the 5% accent rule.** The strip lost
twice: on the black plane it was the colour of the hero behind it, and even
repainted it was still a strip at the foot of the window — the shape every
visitor has learnt to dismiss unread, because that is where cookie bars, chat
bubbles and app prompts all live. A tall card in the corner reads as something
addressed to you. It takes 13% of a 1440×900 viewport, which is the point, and
it disappears the instant a button is pressed. It still does not dim or block
the page: a visitor may ignore it, read the whole site and answer later —
what it may not be is invisible.

**⚠ `LOAD_BEFORE_CONSENT = true` in `src/lib/consent/consent.ts`, at the
owner's instruction, 23 Aug 2026.** While it is true, Google Analytics and
Clarity load for anyone who has not yet answered the banner. It was an
environment variable for one revision; a constant replaced it because a
variable that must match in `.env.local` and on the host ends up set in one and
forgotten in the other.

**THIS IS A STANDING DECISION, NOT A TAIL TO BE TIDIED.** The owner instructed
on 23 Aug 2026 that the consent default, the banner and the privacy text stay
exactly as they are until he says otherwise. Do not flip the constant, reword
the policy or restyle the banner as a side effect of other work, and do not
re-open the argument each session — it was made once, in full, and the costs
are written out below so that a later session inherits the reasoning rather
than the debate. The line changes when he asks for it.

**What it costs, so nobody has to rediscover it.** The privacy policy states
in three languages that nothing loads before agreement — that sentence is
false while this is true. Clarity may record a session on the page where a
visitor types their budget and their circumstances into the enquiry form. The
console prints a warning naming the constant and its file on every load it
causes.

**What still holds:** a stored decision always wins, so "Only necessary"
genuinely stops both tools — measured. The gate is intact; only its default is
inverted, which is what makes this one line to flip rather than a rebuild.

**The banner's own copy must not carry the strong claim.** It says declining
breaks nothing and the choice can be changed — true in either state. It does
NOT say "nothing loads until you agree", because that sentence printed
directly above the button would be a lie in the worst possible place. Leave it
that way even after the constant goes back to `false`; the policy is where the
mechanism is described.

Measured against the network, not reasoned about. With `LOAD_BEFORE_CONSENT`
false: before any decision, zero requests to googletagmanager,
google-analytics or clarity.ms; after "Only necessary" and a reload, still
zero; after "Accept", both load. With it true: both load with no decision, the
warning fires, and a stored refusal still produces zero on the next load. Both
states were checked. Re-run both after touching anything in
`src/lib/consent/`.

**Clarity masking: done, confirmed by the owner 23 Aug 2026.** The privacy page
says session recording masks what a visitor types; masking is a per-project
setting in the Clarity dashboard (Settings → Masking) that no client-side code
can set, and it is switched on. Closed — do not raise it again.

The policy's "nothing is switched on yet" section was deleted in the same
commit that shipped the tags, which is the rule that section itself stated.
Advertising measurement stays described and marked as not in use, because no
advertising tag is loaded — with or without consent.

The controller's identity (name, legal form, NIP) lives in `CONTROLLER` in
that same file as a language-neutral constant, NOT as a Sanity field: a legal
identity an editor can reword per locale is one that will eventually be wrong
in one of them. `privacyPage` is the only schema on the site with an array of
sections rather than fixed fields, and its own file carries the argument for
why a legal text is the exception.

`SectionHead` takes a `level` prop because of this page: it defaults to an
`h2`, which is right for a numbered section of the home page and wrong for the
only head on a standalone page. The policy passes `level={1}`. A page whose
highest heading is an `h2` has no title as far as a screen reader or a crawler
is concerned, and this one had exactly that fault until it was measured.

`LegalDocument` overrides `--container-max-width` to 76rem. It is the one
place that narrows the container, because it is the one page with a single
column of prose and nothing to put beside it — at the sitewide 106rem it
reproduced exactly the fault the spread head exists to fix.

## The hydration warning that is not ours

`<html>` and `<body>` in `src/app/[locale]/layout.tsx` carry
`suppressHydrationWarning`, and it stays there. Browser extensions write
attributes onto those two elements before React hydrates — ColorZilla adds
`cz-shortcut-listen="true"` to the body, several password managers and
Grammarly stamp the html element — and React reports every one of them as a
mismatch the server caused. The server did not: the attribute exists only in
that visitor's DOM.

Reproduced and both directions measured, 23 Aug 2026, against `next dev` with
the attribute injected before hydration: without the flag the exact reported
error appears; with it, nothing. The same harness also stamped an attribute on
a child `<header>` and React still reported it — **the flag is one level deep**,
so it silences these two elements' own attributes and text and nothing below.
Every real hydration bug in the tree still surfaces.

Do not "fix" a hydration warning by moving this flag onto the component that
warns. That is how a real mismatch goes quiet. If a warning names something
inside the app, it is ours.

## NEXT_PUBLIC_SITE_URL is not optional in production

Found 25 Aug 2026, from a sitemap whose every URL carried a build hash:
`https://moveandinvest-3i2tk9o2y-….vercel.app/…`. The variable was not set on
the Vercel project.

**`VERCEL_URL` is ALWAYS the deployment's own hostname**, even in production
with a custom domain attached — it is never the custom domain. So the middle
rung of `getSiteUrl()` cannot serve production, and the variable is genuinely
required rather than merely recommended.

**What was actually broken was not the sitemap.** Without the variable,
`isProductionDeployment()` is false, so `robots.txt` served `Disallow: /` and
every page carried `noindex, nofollow`. The whole site was closed to search.
The sitemap's hostnames were the visible symptom of an invisible one.

**The guard is correct and stays.** A forgotten variable meaning "do not index"
rather than "index the wrong address" is the right way round, and it did its
job: it kept a half-built site out of the index for two days. Falling back to
Vercel's production-domain variable would put a site into the index without
anybody deciding to. Not doing that.

**What was wrong was that the guard was SILENT.** It now prints, once per
process, naming the consequence and the fix. The first version printed on every
call and produced forty-five identical paragraphs in one build log — a warning
nobody reads is the same as no warning, so it is once.

Both states verified against a real build: without the variable, `Disallow: /`
plus `noindex, nofollow` and one warning; with it, the named-bot rules,
`index, follow`, and `https://moveandinvest.com/…` throughout.

## robots.txt and the sitemap

Both ported from the sibling `giuseppeiannone` project. `src/app/robots.ts`
existed first; `src/app/sitemap.ts` landed 23 Aug 2026, and until it did the
robots file advertised a sitemap that returned 404 — a worse signal than no
sitemap line at all, because it tells a crawler to expect one and wastes the
fetch.

**Everything written for a reader is open.** The three disallowed paths are
not exceptions: `/studio` is the CMS, `/api/` answers a POST with a redirect,
and `/styleguide` is an internal reference for building the site. The
styleguide is listed under two shapes — `/styleguide` and `/*/styleguide` —
because the locale prefix is part of the path for ru and pl, and a bare entry
would cover only the unprefixed one. No document in the dataset carries
`seo.noIndex`; if a page ever needs holding back, that flag is the mechanism,
not this list.

**The environment decides at BUILD time, not per request.** `robots.ts` is a
static route, so `isProductionDeployment()` is evaluated once when Vercel
builds — which is correct, because Vercel sets `VERCEL_ENV` at build. Measured
both ways: a build with `VERCEL_ENV=production` and `NEXT_PUBLIC_SITE_URL` set
produces the full allow list plus the sitemap line; a build without them
produces `User-Agent: * / Disallow: /`, so local dev and every preview
deployment are uncrawlable without a separate toggle.

**The sitemap is a list of routes paired with the Sanity type that owns each**
(`ROUTES` in that file). Adding a page to the site is adding a line there. A
language appears only if its own document exists AND is not noIndex, and the
hreflang set is built from that same filtered list, so an indexable language
never advertises a sibling being held out. `x-default` is added when the
default locale survives — it has to be, because `buildMetadata` puts one in
the page's own alternates and Search Console reports a mismatch between the
two as an hreflang error.

**Jurisdiction pages are in the sitemap as of 23 Aug 2026**, and they cannot
go through `ROUTES`: their path is a slug that differs in every language, so
their URLs come from the documents and the hreflang set is assembled by
grouping on the `country` each references. That closed the 404s the sitemap
work surfaced — the table and the footer had been linking to five pages that
did not exist.

## Jurisdiction pages

`src/app/[locale]/[slug]`, built 23 Aug 2026, ported in shape from the sibling
`giuseppeiannone` project's own `[slug]` route: static params from published
slugs per locale, breadcrumbs rendered twice (visibly and as JSON-LD from one
array), a facts strip under the hero, an FAQ scoped to the entity.

**Simpler than the sibling in two places, both deliberate.** It resolves one
document type, so there is no slug-collision arbitration and no second round
trip. And hreflang comes from the shared `country` reference rather than from
a `translation.metadata` document — all three language versions point at the
same registry entry, which is the relationship the comparison table already
depends on. The sibling has to defend against its metadata document not
existing; here there is nothing that can be missing.

**The facts strip's labels are fetched from the home page's own table column
labels**, not written again in the message catalogue. The strip and the table
show the same four figures, and two places naming the same figure are two
places that eventually name it differently.

**Three JSON-LD blocks, separate rather than one @graph** — WebPage,
BreadcrumbList and FAQPage — so a malformed one invalidates only itself. The
FAQPage is the point: an answer engine reads a table as prose it must parse
and a FAQPage as an answer it can lift, and being quoted is the whole
positioning. It is emitted only when questions are actually on the page;
marking up questions a reader cannot see is what the format is policed for.

**Version one rendered no prose; the prose was written on 23 Aug 2026** and
lives in `scripts/copy/jurisdictionBody.ts`, delivered to already-published
documents by `npm run facts -- --write` alongside the figures. `body` stays
optional on `countryPage`, so Cyprus — which has no entry — renders no heading
over an empty column.

Four rules govern that file, and they are the reason the pages are worth
having:

1. **Every claim comes from `docs/figures-verification-2026-08-23.md`.** A
   sentence may not change here without that document changing in the same
   commit. The alternative — essays written from memory under a site whose
   position is "the figures are checked" — would undo the verification work
   the same week it was done.
2. **The same four sections, in the same order, on every page**: who it suits
   and who it does not; what stands behind the headline figure; what changed
   and when, with the date; what happens after the first permit. A reader
   comparing two jurisdictions compares the same paragraph. Section three is
   the one that earns the position — every competitor publishes a threshold,
   almost none says which month it stopped being the old one.
3. **About 550 words, not 1,500.** Length stopped being a ranking signal, and
   padding a page whose substance is four figures and their conditions is how
   a checked-numbers site starts reading like a filler one.
4. **Sources are named in running text, not linked.** "art. 100 of Law
   5038/2023" is quotable by an answer engine exactly as it stands; a link is
   not, and a link also rots.

**Copy is authored as text, not as JSON.** `scripts/copy/portable.ts` converts
a three-token syntax — `## ` for h2, `### ` for h3, a blank line for a new
block — into Portable Text. A Portable Text block is nine keys of scaffolding
around one sentence, and twelve bodies written that way is a file nobody
proofreads. Keys are derived from the position, never `Math.random()`, so
re-running the script on unchanged copy produces byte-identical documents and
Sanity records no spurious revision.

**A space between two digits becomes a non-breaking space**, and that is not
cosmetic. Russian and Polish group thousands with a space, so "€100 000" is one
number containing a break opportunity — at 360px it duly broke, "€100" ending a
line and "000 в год" starting the next. English is unaffected because it groups
with a comma. Nothing in the type system or the linter can see this; it was
caught by screenshotting the rendered Russian page at phone width.

**The rule lives in `scripts/copy/typography.ts`, not in the converter.** It
started inside `copy/portable.ts` and therefore protected exactly the strings
that went through it — which meant the comparison table did not have it. The
Greek tax cell ("Non-dom, €100 000 в год, отдельная инвестиция €500 000") never
touches the converter and was breaking on the live Russian and Polish home
pages; found on 24 Aug 2026 while looking at the PDF, then confirmed on the
site with a `Range` over the text node and `getClientRects()` — a broken number
spans two line boxes — rather than by eye.

`COUNTRY_PAGES` and `SOURCE_NOTE` are now exported through `tightenDeep()` at
the bottom of `copy/jurisdictions.ts`, so `seed`, `facts`, the PDF and anything
written next get it without asking. **Do NOT type non-breaking spaces into the
copy files**: they are invisible, and a file where some spaces are load-bearing
is proofread wrongly forever after. `messages/*.json` still holds three plain
ones per locale (the budget labels); measured, they do not break at any width
the site renders, and hand-editing invisible characters there would cost more
than it buys.

Measured after wiring, 36 renders — four jurisdictions × three languages ×
360/768/1440: one `h1` and four `h2`s each, 72–74 characters per line at 1440,
no element overflowing the viewport, no number broken across a line.

**Interpolating a country name into a sentence is a case bug in two of the
three languages.** "Вопросы про {name}" renders "про Греция" — the noun needs
the accusative, and the registry stores the nominative. Every heading that
takes `{name}` must therefore be phrased so the name sits in the nominative:
"Частые вопросы — Греция", not "Вопросы про Грецию". Same in Polish. Caught by
reading the rendered page, not by any check.

**The closing CTA preselects the jurisdiction**, through the same channel the
route finder already uses: it writes `{ jurisdiction: code }` into
sessionStorage and `EnquiryPrefill` ticks the matching `where` radio from it.
No query parameter, no change to the handler, and with JavaScript off the link
still navigates — it simply arrives without the country ticked, which is the
normal state of a form.

That work moved the storage key into **`src/lib/routeAnswers.ts`**, and it
stays there. Three components touch it now — the route finder writes, the form
reads, the jurisdiction CTA merges — and a component barrel is not somewhere
the other two may import from: `country/` reaching into `marketing/` by deep
path is the dependency direction this file forbids. Before the move the key
was a constant in one component and a bare string literal in another, one
rename away from a silent break: the form would just stop prefilling and
nothing would error.

`mergeRouteAnswers` merges and never replaces. Measured both ways: from a
jurisdiction page cold the form arrives with the country ticked; with the
route finder answered first, the budget, the deadline and the priority all
survive and only the jurisdiction is overwritten — which is the right
precedence, since the page a reader is standing on beats a suggestion they
were shown earlier.

## Brand images: the favicon and the unfurl card

Built 23 Aug 2026 by `scripts/og.ts` (`npx tsx scripts/og.ts`), which writes
`src/app/icon.svg`, `src/app/apple-icon.png` and `public/og/{en,ru,pl}.png`.
Both prerequisites are checked by the script and named in its error: a build
must have run (the fonts are read out of `.next/static/media`) and playwright
must be installed locally.

**The mark is Spectral 600's own ampersand, as an outline.** Not drawn, not a
different face: the wordmark in the header is `move&invest` with the ampersand
in accent, so the ampersand alone is the only mark this site can have without
inventing one. It ships as a path because a favicon is rasterised in a context
that loads no fonts — an SVG icon naming a family gets the system serif or
nothing. `scripts/og.ts` records the fontTools snippet that produced the path.
The glyph is 44 of 64 units: measured at 16px, where 40 reads as a square with
something in it and 48 crowds the edges.

**Settled 23 Aug 2026, do not reopen.** Five alternatives were rendered at 16,
24, 32 and 64 next to the wordmark — mirrored, turned (the Unicode ⅋), full
bleed, cropped by the square, and inverted — after the owner noted the mark
resembles a corporate seal. Two findings worth keeping: the resemblance comes
from the composition (a small serif letter centred in a solid square), not from
the ampersand, so mirroring does not touch it; and both mirrored forms stop
reading as an ampersand at 16px and disagree with the header wordmark, whose
ampersand is upright. The owner chose to keep the current mark.

**One OG card per LANGUAGE, not per page.** The page's own title sits directly
beside the image in every unfurl, so a card repeating the country name spends
the only picture the reader gets on something already on screen. The card
carries the home hero's headline — imported from `scripts/copy/home.ts`, not
retyped — the wordmark, and the jurisdiction labels.

**No figures on the card, ever.** A threshold baked into a PNG is a number
`npm run facts` cannot correct. Everything else on this site can be fixed by
running a script; an image cannot, and a stale figure is the one thing the
positioning does not survive.

**`playwright` is not in package.json and must not be.** It runs the generator
and never the site. `scripts/playwright.d.ts` declares it untyped so
`tsc --noEmit` still passes over a file that is not part of the app — delete
that file if playwright is ever added properly.

**`ogImage()` is repeated on every page that declares `openGraph`.** Next
merges metadata shallowly: a child that sets `openGraph` replaces the parent's
object whole, images included, so an image set once in the layout reaches no
page that has its own. The Twitter card is written out for the same reason —
Next does not derive one from openGraph, and without `summary_large_image` the
picture is cropped to a small square.

## The 404

`src/app/[locale]/not-found.tsx`. It renders inside the locale layout, so the
header, the footer and the language switcher are all still there — measured at
360, 390, 768 and 1440: status 404, one `h1`, correct `<html lang>`, locale-
correct links, nothing overflowing.

**Measuring it needs `waitUntil: "networkidle"`.** With `domcontentloaded` the
harness reads an intermediate document — Next serves the not-found shell with
`id="__next_error__"` and the layout arrives after — and every assertion comes
back empty, which looks exactly like a page that renders nothing. The 404 was
briefly declared broken on that evidence.

**It lists no jurisdictions and fetches nothing.** The footer directly below
already lists all five in this locale from the registry, and a 404 is the page
a crawler hits dozens of times an hour — a Sanity round trip on each buys a
heading the message catalogue already has.

It cannot move above the `[locale]` segment: `not-found.tsx` receives no
params, and it resolves the language only because the locale layout called
`setRequestLocale` for this request before anything threw.

## Property pages: the buying half

`propertyPage`, built 24 Aug 2026. One per jurisdiction per language, at its
own top-level slug — `/property-in-greece`, `/nedvizhimost-v-gretsii`,
`/nieruchomosci-w-grecji`.

**It is a separate page, not a section of the jurisdiction page**, because the
two questions belong to different people at different moments: "where should I
move and what does it cost" against "I have chosen, what do I need to know
before I sign". Folded together they make one page twice as long that answers
neither first — which is the shape that stops being quotable.

**It lives at the top level rather than under `/property/…`** because the query
is "недвижимость в Греции" and a URL that answers it should say so. The first
segment of `/property/greece` is a word no reader typed.

**Six named fields, not a section array.** Same argument as `countryPage`'s
four named comparison fields: a reader comparing Greece against Malta must be
able to compare the SAME paragraph. The order is fixed in code — who may buy,
what the purchase costs, the steps, what is payable every year, short-term
letting, how it connects to residency.

**The section headings come from the message catalogue, not from Sanity**, so
all four pages in a language carry byte-identical headings. An editor who could
retitle "Who may buy" on the Greece page alone would break the one promise
these pages make. The bodies are Portable Text in Sanity; the headings are not
editable content.

**Every claim traces to `docs/property-verification-2026-08-24.md`** — same
rule as the figures: a sentence may not change without that document changing
in the same commit. That dossier marks its own gaps as NOT CONFIRMED, and a
NOT CONFIRMED claim either does not reach the page or reaches it with the
uncertainty stated. Notably: no end-to-end durations for Greece or Portugal
(no government source publishes any), no Maltese short-let licence fee, and no
answer on whether a Dubai owner-occupier pays the housing fee.

### The slug route now resolves two document types

`src/app/[locale]/[slug]` queries `countryPage` and `propertyPage` **in
parallel** and the jurisdiction page wins a collision. Parallel, not
sequential: a sequential lookup would make every property page pay for a miss
on the jurisdiction query first, and property pages are half the routes.

A collision is logged with both document ids. It can only happen by editorial
mistake, and the correct number is zero — but a page that vanishes with no
trace is the kind of bug that survives for months.

`localizedPaths` now takes the alternates array rather than a document, so both
types share one hreflang builder. Two copies would be two places for the
x-default rule to drift, and the drift stays invisible until Search Console
reports it weeks later.

**The sitemap groups the two sets SEPARATELY**, even though they share a URL
space and a `country`. Grouping them together would put `/greece` and
`/property-in-greece` in one hreflang set — telling a search engine that the
Russian version of the buying page is the English jurisdiction page, which is
the exact mistake hreflang exists to prevent.

**Breadcrumbs are three deep and the middle crumb is a real parent**: the
jurisdiction page for the same country. That is the actual hierarchy, and it
gives a reader who arrived from "property in Greece" one click to the residency
figures. The crumb loses its link, not its place, when that page does not exist
in the language.

The two pages cross-link once each, in prose, at the end of the body — not a
grid of "related pages" cards, which is what a site builds when it has nothing
specific to point at.

Measured after wiring, 12 renders — four jurisdictions × 360/768/1440: one
`h1`, six `h2`s, six contents anchors all resolving to a section that exists,
nothing overflowing, WebPage and BreadcrumbList emitted on each.

### The prose, and the rule that shapes it

`scripts/copy/propertyBody.ts` — 17,000 words across four jurisdictions and
three languages, delivered by `npm run facts -- --write` to documents that are
already published. The frame (slug, title, intro, sources) is in
`scripts/copy/property.ts` and comes through `npm run seed`.

**A DOCUMENT TYPE THAT SEEDS AS A DRAFT MUST BE ADDED TO `PUBLISHABLE` IN
`scripts/publish.ts`.** `propertyPage` shipped with the seed writing twelve
drafts and that set still naming two types, so the only way to publish them was
by hand in Studio. `npm run inspect` now lists property pages and their
per-language published counts for the same reason it lists jurisdiction pages:
a type that seeds invisibly and publishes only by a second command needs a
place that says out loud where it stands.

**The hardest discipline in that file is the absence of durations.** Every
competitor publishes "the whole process takes two to three months". No Greek or
Portuguese government body publishes an end-to-end figure at all, and the
numbers in circulation are consultants' estimates repeated until they sound
official. Where a duration IS published it is here with its source: 35 days for
a Maltese permit, 25 minutes at a Dubai trustee office, 60 working days for a
Portuguese municipality to object, two months of life in a Greek engineer's
certificate, 60 days to register a Dubai transfer. Where it is not, the page
says nobody publishes it. That sentence is more useful to a buyer than a
confident invention, and it is the only one of the two that stays true.

The same rule covers the dossier's own gaps: the Maltese short-let licence fee
in euro, whether a Dubai owner-occupier pays the housing fee, the tax year the
new Greek rental scale starts from. Each is on the page AS an open question,
named, rather than resolved by guesswork or quietly omitted.

**Every section leads with what changes the reader's plan**, not with context.
Malta's opens on the prohibition, not on the island. Portugal's cost section
opens on the 7.5% surcharge. Greece's short-let section ends on the one fact
that costs buyers the most — that the registration does not pass with the
property.

Measured on the real prose: 67 characters per line at the widest, no number
broken across a line in any of the twelve pages at 360px.

## The property brief

The form at the foot of every property page, built 24 Aug 2026. Five fields,
two of them required: budget, city, purpose, notes, name, email, consent.

**It posts to `/api/enquiry` with `kind=brief`.** Not a second route. The
honeypot, the rate limit, the two interchangeable delivery channels and the
consent rule are the parts that must never drift, and a second route is a
second copy of all four — the copy that gets forgotten when one of them is
fixed. The route now has three reader-facing shapes and one handler.

**The jurisdiction is a hidden field, not a question.** The page the reader is
standing on has already answered it. The home page form asks because there it
is genuinely open.

**`returnTo` is the only place on that route where user input reaches a URL**,
and it is the reason the brief needed care the other two forms did not: the
form lives on twelve pages, so the redirect target cannot be a constant. It is
matched against `^[a-z0-9-]{1,96}$` and anything else falls back to the locale
root. Verified by measurement, not by reading: `https://evil.example`, `../..`
and `ru/admin` all redirect to the home page, and a valid slug returns to its
own page.

**Two fields were added to the shared payload rather than a second shape.**
`city` and `purpose` are optional on `EnquiryPayload`, and `kind` discriminates.
The internal email changes its heading, its subject and two of its rows from
that flag. A second payload type would have meant a second email template, a
second stored document and a second log line, for a form that differs by two
fields.

### The bug this step found: the "our fault" panel was invisible

Both older forms render three result panels — sent, your-mistake, our-mistake —
and both stylesheets listed only the first two in the `:target` selector. So
`#enquiry-failed` and `#partner-failed` existed in the markup, the route
redirected to them, the browser scrolled to an invisible anchor, and a visitor
whose enquiry had just been dropped saw a page that appeared to do nothing.

That is worse than the fault the panel was written to replace: a page that
blames the visitor at least tells them something happened. Measured with
`getComputedStyle` on each id at its own fragment — three `block`, two `none` —
and fixed in both stylesheets the same day.

**Adding a result panel means adding it to the `:target` selector.** Nothing in
the type system, the linter or the build can see this one; the only thing that
catches it is navigating to the fragment and looking.

## Measuring a lead

`src/lib/analytics/lead.ts` and `components/layout/LeadTracking`, built 24 Aug
2026. One GA4 `generate_lead` event and three Clarity calls per delivered lead,
from all three forms.

**The event fires on the RETURN, not on the click**, and that is forced by the
architecture rather than chosen for elegance. Every form here is a plain HTML
form that posts and gets a 303 back to a fragment — deliberate, so they work
with JavaScript off — which means there is no moment in the browser where "the
enquiry succeeded" is a return value. The only evidence is the fragment the
server chose, and it arrives with a full page load.

Two consequences to know before reading the numbers:

- **It counts DELIVERED leads, not attempts.** The route only redirects to a
  success fragment once a channel accepted the payload. A lost lead is not
  counted as a lead, and a bot that trips the honeypot is not either — it gets
  the success fragment but never wrote a stash.
- **A visitor with JavaScript off is never counted.** Nothing can fix that
  without breaking the no-JavaScript promise, and counting clicks instead would
  count spam and failures too.

**The stash is what makes it fire exactly once**, and it is why there is no
"already fired" flag. `LeadTracking` writes one sessionStorage entry when the
form is submitted and consumes it when the event fires. A refresh of the
thank-you page finds nothing and sends nothing; a second genuine submission
writes a fresh one and is counted. A flag would have had to guess which of
those two it was looking at.

**⚠ THE JURISDICTION IS NOT MEASURED, AND MUST NOT BE ADDED.** The first
version of this sent it to GA4 and tagged the Clarity session with it. The
privacy policy says, in three languages, in the section headed "what we do not
do, whatever you agree to": *"If a tool one day records that an enquiry was
submitted, it records that fact and nothing in it — not your email address,
NOT THE JURISDICTION, not the budget, not a word of what you typed."*

It was caught the same day, by re-reading the policy for an unrelated reason,
and the code was changed rather than the sentence — the promise is one of the
few things that distinguishes this site.

What survives is `form_path`, which describes the submission and not its
contents. On a property page it answers the same question anyway, because the
country is in the URL. On the home page form the country is something the
visitor chose inside the form, so it is not measured at all. That is the
promise working, not a gap to close.

**`hasConsent`, not `runWhenConsented` — the one place in the codebase that
reaches a tag without subscribing.** `runWhenConsented` waits and fires when
permission arrives, which is right for a loader and wrong for an event about a
moment that has passed: a visitor who declines, sends a brief, and accepts
cookies twenty minutes later would otherwise produce a lead event stamped to
the acceptance, from another page. The event is dropped instead, and the
subscription that would never have been released is not created.

**GA4 custom parameters need registering as custom dimensions** in Admin →
Custom definitions — `form_kind` and `form_path`, event-scoped.
Until that is done the event count shows and the breakdown does not, which
looks like a bug in this code and is not.

Measured, six cases: a cold landing on the success fragment sends nothing; a
submission whose delivery failed sends nothing; a success return with a stash
sends exactly one event with the right three parameters; a reload sends
nothing; another form's stash is not consumed; and consent gates it — accepted
one, declined zero.

## The change list

The signup at the foot of every jurisdiction and property page, built 24 Aug
2026. One field, one checkbox, an optional row of five jurisdictions.

**The offer is what the site already does, and that is the whole design.** Not
a newsletter and not tips: an email when a threshold, a tax or a requirement
becomes something else, with the statute and the date. The verification
dossiers are the evidence that the project actually tracks that, and an offer
of "useful updates" would have been a promise with nothing behind it. The copy
says out loud that there will not be many letters, because there will not be —
fewer than ten changes across five countries in 2026.

**Its consent is NOT the enquiry's consent, and the two may never be merged.**
`consentToShare` is permission to pass a person's circumstances to a third
party; `consentToEmail` is permission to send them email. Different purposes,
different legal bases, different withdrawal. One checkbox covering both is the
shape a regulator reads as bundled consent, and it would be dishonest to the
reader besides.

**It sits AFTER the larger ask on both page types**, never before. It is the
exit for a reader who did not take the brief or the enquiry, and putting it
first would make the larger ask look like the alternative to it. It is also
visually lighter — light plane, one row — because two asks on one page compete
and the loser should be the one that costs the reader least.

**Unticked jurisdictions mean all five**, and the hint says so. A row of empty
checkboxes reads as "you have chosen nothing" and would cost subscriptions.

**The policy gained a section rather than the feature going out uncovered.**
Collecting an address for a purpose the published policy does not describe is
not a thing to fix later; `scripts/copy/privacy.ts` now has "The change list"
in all three languages, and it states the separate consent, what is kept
(address plus the jurisdictions, nothing else), and that leaving takes one word
in a reply. The cookie banner and the consent default were NOT touched — that
freeze holds.

**There is no email service behind the list.** The address arrives as a
notification in the same mailbox as everything else, and the internal email
says out loud that it has to be moved to a list by hand. That is the honest
state of it: `subscriber` exists as a schema type in the private dataset for
the day that dataset is configured, and until then the email is the record —
the same doctrine as the enquiry. Wire an ESP before the list is worth sending
to, not after.

## The comparison PDF

`scripts/pdf.ts` → `npm run pdf` → `public/comparison/{en,ru,pl}.pdf`. ONE A4
sheet: the four-question table, the cost bars, the source note, the Cyprus
exclusion. Built 24 Aug 2026 as the second half of the change list's offer.

**One sheet is a promise and the script enforces it.** The signup copy and the
confirmation email both say "one printable sheet"; the first version spilled
three lines onto a second page in all three languages and nobody would ever
have reported it, because a PDF that opens is a PDF that looks fine. `npm run
pdf` now reads `/Count` out of the page tree and throws, naming the languages,
if any file is longer than one sheet. A miss prints "page count UNCHECKED"
rather than passing silently.

**The title counts CODES rather than saying a number.** It read "Five
jurisdictions, compared" over a table of four, which is the exact artefact this
project exists to be an alternative to — and it survived a full read because a
number in a title is not where anyone looks. It is now derived, with
`Intl.PluralRules` for the noun, because Russian and Polish change it between
four and five. The word "four" is still typed by hand in the email label and in
`messages/*.json`; if Cyprus ever gets primary sources, those move with CODES.

**It is generated, never designed by hand, and the reason is the same one the
site exists for.** Every figure is imported from the modules the site itself
renders from — `scripts/copy/costs.ts` for the totals, `copy/jurisdictions.ts`
for the table and the source note, `copy/home.ts` for the labels. So the PDF
agrees with the site by construction, and correcting a threshold is one edit
followed by one command. A hand-made file would go stale the first time a rule
changed, with nothing to say that it had.

**Regenerate it after `npm run facts -- --write`, in the same sitting.** That
is the command that changes a figure, and a PDF that disagrees with the page it
was derived from is worse than no PDF: it circulates, it gets forwarded, and it
cannot be corrected in place. `npm run build` first — the fonts come out of
`.next/static/media` via `scripts/embedFonts.ts`, shared with `scripts/og.ts`
so a generated image and a generated document can never end up in different
weights.

**`FACTS` lives in `scripts/copy/costs.ts`, not in `scripts/facts.ts`.** It was
moved there on 24 Aug 2026 because `facts.ts` throws at module load when
`SANITY_API_WRITE_TOKEN` is unset — correct for a script that writes to live
content, fatal for anything that only wants to read the numbers.

**Cyprus is excluded, in print, with the reason printed.** The registry lists
five jurisdictions and this document shows four. The dossier's conclusion is
that Cyprus rests on secondary sources, and a PDF is the worst possible place
to publish a number nobody has read from a primary one.

**It is gated behind an address, and the gate is a convenience, not a fact.**
Every figure in it is already free on the open pages in all three languages.
What the PDF adds is form: four routes on one printable sheet. The confirmation
email says exactly that rather than implying something has been unlocked —
`comparisonLink()` in `src/lib/enquiry/sender.ts`, absolute URL from
`getSiteUrl()`, because a relative href in an email resolves against nothing.

**`/comparison/` is disallowed in robots.txt, and NOT because it is secret.**
It is a second copy of open pages with worse markup and no internal links;
indexed, it would compete with its own source for the query it was derived
from. The exclusion protects the pages. That reason is written into
`src/app/robots.ts` beside the entry, because "we gated it" is the wrong reason
and someone will eventually try to write it there.

**The email template gained a link slot for this, and it is a text link.** Not
a coloured button: a filled cell with white text is the first thing a spam
filter reads as marketing, and this is the quietest email the site sends. The
bare URL is printed under the anchor so it survives a client that strips
anchors, and `renderEmailText` prints label and URL on their own lines.

## /about — the method page

Built 24 Aug 2026. `aboutPage` singleton per language, `scripts/copy/about.ts`,
written by `npm run content -- --write`, rendered by `MethodDocument`.

**It exists because the site claimed independence and substantiated it
nowhere.** "Independent research" sits in the eyebrow of every page, and until
this page the legal identity appeared in exactly one place: the controller
section of the privacy policy — behind a page nobody opens voluntarily. A site
whose product is the traceability of a figure was itself untraceable.

**The H1 names the PROJECT; the method is section 1.** The first version had
this backwards and the owner caught it: its H1 read "How a figure gets onto
this site", which is word for word the heading of the section directly below —
so the H1 did no work of its own. It also answered a question the reader has
not asked yet. Somebody who opens /about is asking who this is; the method
answers their second question, not their first. Three names for one page (the
`/about` URL, the footer link "Method and sources", and that H1) disagreed as
well, and the JSON-LD declares `AboutPage` with `mainEntity: Organization`
while the strongest on-page signal talked about figures. Now: eyebrow carries
the page type, H1 names the project and what it is answerable for, footer label
matches, and "how a figure gets onto this site" is the heading of section 1.

**Its CONTENT is about the method, not about a person, and that is the
stronger position rather than a modest one.** Personal authority — "trust me, twenty
years in this" — cannot be checked and this project does not have it.
Procedural authority — "do not trust me, here is the statute and the date" —
can be checked by anyone. Hence: no biography, no mission, no team, no
years-in-business.

**Five sections in a fixed order, as named schema fields, not an array.** The
opposite call from `privacyPage`, and deliberately: a legal text has no design
to fix its composition, this page does. An editor who could reorder or drop one
could quietly turn it back into an About page — most easily by deleting section
2.

**Section 2, "what is NOT verified here", is the one that must survive every
future edit.** Cyprus resting on secondary sources; the timelines no ministry
publishes; the costs that exist only as market practice; the one-applicant
basis of every total. No competitor has this section, and it is the reason a
reader believes the other four. Every edit will be tempted to soften it,
because admitting Cyprus is unverified feels like admitting the site is
incomplete. It is the opposite.

**Section 3 states BOUNDARIES, never a price and never a payment model** — the
standing decision in "Business decisions already taken" applies here in full.
It then names the conflict of interest out loud, and backs it with two things a
reader can check rather than take on trust: the same method is applied to Malta
and the UAE, where paying for a referral is prohibited and criminal
respectively and which therefore can never pay; and figures that argue against
leaving an enquiry get published anyway.

**The author block sits INSIDE the corrections section, never at the top.** At
the top it is a credential, which would undercut the argument three paragraphs
above it. Under "if you have found an error" it is what it actually is: the
face of the person who is wrong when a figure is wrong.

**A missing portrait is not a broken image.** `findPortrait()` checks
`public/author.{jpg,jpeg,png,webp,avif}` on disk and the block renders as text
when there is none. The site takes no paid stock imagery, so the alternative to
a real photograph is NO photograph — never a placeholder silhouette. Both
paths were rendered and looked at.

**The legal identity moved to `src/lib/controller.ts`.** It lived in
`scripts/copy/privacy.ts`, correct while the policy was the only consumer.
Three things name it now — the policy, this page, and the Organization node —
and two of the three are rendered by the app, which cannot import from
`scripts/`. The copy script imports it back across the boundary; that direction
is the right one, because `src` is what ships.

**Measurement note: `fullPage: true` does NOT scroll in Chromium**, so a
`loading="lazy"` image below the fold is never requested and the screenshot
shows an empty box where a face should be. Twice this looked like a broken
portrait and twice the image was loading correctly — confirmed with an element
screenshot and with `naturalWidth` off the live DOM. Scroll the page first, or
screenshot the element.

## /sources — the working

Built 24 Aug 2026. `src/lib/sourceData.ts` holds the evidence, `sourcesPage`
holds the head, `SourceTable` renders it. 33 checks, 28 citations, six anchored
sections: pt, gr, mt, ae, citizenship, cy.

**It is the proof of /about's claim.** /about states the method — primary
sources only, a date on every figure, nothing published where no primary source
exists. Until this page that had no evidence attached: the working lived in
`docs/figures-verification-2026-08-23.md`, in git, which is to say nowhere a
reader can reach. A method described but never shown is an assertion.

**THE DATASET IS CODE-OWNED, AND THAT IS INTEGRITY RATHER THAN CONVENIENCE.**
The standing rule is that a figure may not change in `copy/jurisdictions.ts`
without the dossier changing in the same commit. A dataset editable in Studio
routes straight around it: somebody corrects a threshold in a text field, the
dossier still says the old thing, and the one page whose whole purpose is
provable sourcing quietly stops being provable. So `sourcesPage` deliberately
offers **no field** in which to do it — four head fields and no body.

**The citation is primary; the URL is a convenience.** Each source carries its
formal reference — statute, article, gazette issue, date — and that is what a
reader verifies against. This was forced by Greece, whose official gazette
(`et.gr`) publishes only a search form and session-token viewer URLs, so no
durable official link exists at all. A page of URLs would have rotted; a page of
citations does not.

**Every link is labelled `official` or `reproduction`, and that caught a real
problem in the dossier.** Three Greek sources pointed at `taxheaven.gr`, which
reproduces the statute faithfully but is a commercial database, not the gazette
— against the dossier's own rule of "a link to the law or the authority's own
page". Publishing those as primary on this page of all pages would have
undercut its argument. They stay, because a reproduction is where the text can
actually be read, and they are marked.

**The verdict column is the page.** 14 corrected, 7 confirmed, 6 added, 4 not
verified, 2 withdrawn. The deck leads with the fourteen. The instinct is to bury
that number; it is in fact the most persuasive sentence the project can write,
because a comparison that has never found itself wrong has never checked.

**Two visual weights, not five colours.** Oxblood marks `corrected` and
`unverified` — the states where the site was wrong or could not establish
something. Everything else is quiet. Five distinct colours would turn evidence
into a dashboard and would imply a ranking between "confirmed" and "added" that
does not exist. The word is always present, so colour never carries meaning
alone.

**It stacks on narrow screens where `CountryComparisonTable` scrolls, and the
divergence is deliberate.** That table's argument — stacking destroys reading
down a column — is right for its own data, which is figures. These cells are
paragraphs, and side-scrolling sentences is something nobody does. The scan
survives because each card pairs the subject with its chip.

**What is NOT published:** the dossier's closing section on what the findings
break inside the product — the route finder's first budget band answering with
emptiness, the speed question no longer discriminating. That is roadmap, not
evidence, and a sources page padded with it stops being one.

**Linked from three places**, because a page nobody reaches proves nothing:
section 1 of /about, the cost block of every jurisdiction page (deep-linked to
that jurisdiction's own anchor, `/sources#gr`), and the footer.

**`typography.ts` moved to `src/lib` for this.** The sources dataset is the
fourth consumer of the non-breaking-space rule and the first one the app renders
directly, and the app cannot import from `scripts/`. It earned its move within
minutes: "€220 000" and "€4 210,30" broke across lines the first time the page
rendered. `scripts/copy/typography.ts` is now a re-export.

## /contacts — a human channel

Built 24 Aug 2026. `contactsPage` holds the labels, `src/lib/contactChannels.ts`
holds the channels, `ContactChannels` renders both.

**NOT built because Google requires a page called "Contact".** It does not. The
rater guidance asks that ownership and contactability be clear and names the
About page as the natural home, and that was already satisfied — /about carries
the legal entity, and the Organization node now carries a `ContactPoint`. It is
built because a law firm receiving a cold email checks whether the thing is
real, and a form is not that check. A number that is answered is. The audience
is that firm, not a crawler.

**THE CHANNELS ARE IN CODE, NOT IN THE CMS**, and an empty value means the
channel does not render at all — no row, no "soon", no dead link. This site has
twice printed a way to reach it that reached nobody (`partners@`, `hello@`), and
the cost is not a missing row: somebody writes, hears silence, and concludes the
project is not real. One definition feeds the page, the `ContactPoint` and the
footer, so a number cannot exist in one and not the others.

**The booking is a LINK, never an embed.** An iframe from Calendly, Cal.com or
Google pulls a third-party script onto this domain and sets third-party cookies
— which costs a consent gate, a new paragraph in the policy naming the provider
and its country, and an entry in the suppliers list. It buys one thing: the
reader does not leave the page. Opened in a new tab, none of it applies. Same
reason WhatsApp is a plain `wa.me` href and not the official widget. **Verified:
the rendered page contains zero iframes.**

**The form is `kind=question`, and it is not a lead.** No jurisdiction, no
budget, no consent-to-share — that consent is what makes an enquiry passable to
a partner, and a question is answered by us and stops there. It is a separate
payload type for that reason: a shared shape with three empty fields would
eventually be routed like the thing it resembles. It is also **not stored** —
correspondence belongs in a mailbox, not in the leads dataset — so the email is
the only channel and a failure is reported plainly.

**It fires NO `generate_lead` event**, deliberately. Every other form does.
Counting a question would inflate the one number the events exist to measure,
and an inflated funnel is worse than an unmeasured one because it looks like it
is working. Adding `"question"` to `LeadKind` is the tempting version of this
mistake.

**The deck routes the reader.** Somebody who wants an introduction belongs in
the enquiry form; the copy says so before they write, and a pointer sits under
the form's explanation.

**The `:target` panels bit again, and were caught by measurement.** All three
result panels were in the markup, the stylesheet hid them, and nothing un-hid
them — the identical defect to `#enquiry-failed` and `#partner-failed`. A result
panel is invisible by design AND invisible when broken, so it can only be
checked by loading each fragment and reading the computed style. All three now
verified `block` on their own fragment and `none` otherwise, and all four POST
shapes verified against the real route.

## The Organization node

Added the same day, in `src/lib/jsonLd.ts`. Until then there was none — and the
comment on `/for-partners` already claimed "the organisation is described once
sitewide rather than restated on every route", describing something that did
not exist. Every page was a `WebPage` inside a `WebSite` carrying a name and
nothing else: no legal entity, no country, no contact, no publisher.

For a site whose product is the traceability of a figure, that is the gap that
undoes the rest. An engine deciding whether to quote "the Greek threshold is
€400,000" is deciding whether to attribute it to somebody, and there was nobody
to attribute it to.

**One node, one `@id`, referenced everywhere.** The full `Organization` and
`WebSite` are emitted on `/about` only, inside an `@graph`; every other route
carries `isPartOf: { "@id": … }` and `publisher: { "@id": … }`. A JSON-LD graph
is assembled across a site by identifier, so restating the node per route buys
nothing and guarantees the copies drift.

**No `sameAs`.** It takes profile URLs that confirm the identity, and inventing
plausible ones is exactly the fabrication this markup exists to be the opposite
of. It goes in when there are real profiles to point at.

## Two defects found while building /about

**`propertyPage` was in neither `TRANSLATABLE_TYPES` nor the Studio
structure.** No symptom on the site — the four pages render, because the route
reads `language` off the document and seeding writes it. What was broken was
the Studio: no language switcher on a property page, so an editor opening the
Portuguese one had no route to its Russian counterpart, and four published
documents had no pane at all. A page an editor cannot open is a page only a
script can fix. Both fixed in `src/sanity/structure.ts`.

**The site used THREE email addresses and they disagreed — fixed the same
day.** `office@` was the declared data controller; `hello@` was what the
broken-form panels told a visitor to write to; `partners@` was on the partners
page. Only `office@` is a real mailbox, so a firm replying to `partners@` and a
visitor whose form broke were both writing into the void — and somebody who
gets no answer concludes the project is not real.

Now there is ONE address and no place for a second to appear:
`src/lib/controller.ts` holds it, `CONTACT_EMAIL` in `copy/partners.ts` derives
from it, and the three catalogues carry an **`{email}` placeholder** rather
than a typed address, filled on the server in `buildAlertsLabels` and the brief
labels. `buildAlertsLabels` therefore takes `(key, values?)` — narrowing that
signature back to `(key) => string` is exactly what would reintroduce a
hard-typed address.

A related fixture lie surfaced with it: the render harness stubbed
`siteSettings.contactEmail` as `hello@` while the code wrote `partners@`, so
the harness had been showing an address the site never served. Fixed there
too — see "A fixture may not improve on the response it stands in for".

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

Therefore: **nothing carrying personal data ever goes in it.**

**Where enquiries actually live, as of 23 August 2026: in the notification
email, and nowhere else.** The design called for a second, private dataset
(`NEXT_PUBLIC_SANITY_ENQUIRIES_DATASET`), and the project's Sanity plan does
not allow one. So `/api/enquiry` treats storage and email as two
interchangeable channels: an enquiry is delivered if EITHER succeeds, lost
only if both fail, and the visitor is told it failed only in that last case.
Set the variable one day and the dataset half starts working with no code
change. Until then `npm run enquiries` has nothing to read, and the mailbox is
the file.

What that costs, said plainly rather than discovered later: no list to search,
no deletion by one click, and a mailbox outage is a lost enquiry rather than a
delayed notification. The `enquiry` schema type stays in the repo and stays
out of `documentTypes`, so nobody registers it in the content workspace by
habit and quietly starts writing names into the public dataset.

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
- **Every string a visitor can read comes from Sanity.** The message
  catalogues hold site chrome only — nav, footer, locale switcher — plus the
  two clause separators the route finder glues sentences with. That is the
  whole of `messages/<locale>.json`; the `home` namespace went from 88 keys to
  2 when this was enforced. A new section adds fields to the page document, not
  keys to a catalogue.
- **A page is ONE document, with one object field per rendered section**, in
  page order, titled with the number that section shows in its own eyebrow —
  `01. Hero and comparison table`, `02. How the comparison is built`. No field
  groups, no tabs, no section builder: the composition is fixed, and an editor
  should be able to scroll the document alongside the live page and see the
  same order. `src/sanity/schemaTypes/lib/fields.ts` has the three helpers
  (`stringField`, `textField`, `sectionField`) that keep each field to one line.
- **Copy for seeding lives in `scripts/copy/`, imported by both `seed.ts` and
  `content.ts`.** Those two write the same paragraphs to different targets — an
  empty dataset and live documents — and when each kept its own copy, a fix
  landed in one of them only.
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
