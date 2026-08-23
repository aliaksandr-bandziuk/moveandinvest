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
- **No audience capture.** The brief names owning the audience as the second
  defence against partner dependency. Today the only way to give us an email is
  to submit a full enquiry with consent to be passed on — a reader who is not
  ready yet leaves no trace.
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
owner's instruction, 23 Aug 2026, so the tags can be verified.** While it is
true, Google Analytics and Clarity load for anyone who has not yet answered
the banner. It was an environment variable for one revision; a constant
replaced it because a variable that must match in `.env.local` and on the host
ends up set in one and forgotten in the other.

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

**OPEN, AND IT IS A PROMISE THE POLICY ALREADY MAKES:** the privacy page says
session recording masks what a visitor types. Masking is a per-project setting
in the Clarity dashboard (Settings → Masking; "Strict" masks all text and
input) and no client-side code can set it. Until that is confirmed in the
dashboard, the policy is claiming something this repo cannot deliver — and the
thing at stake is somebody's budget and circumstances typed into the enquiry
form.

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

**Version one renders no prose.** `body` is optional on `countryPage` and the
section appears the day it is filled, no code change. Writing 1,200 words per
jurisdiction per locale was rejected for now: every figure on this site is
sourced and dated, and twelve unsourced essays would undo exactly that.

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
