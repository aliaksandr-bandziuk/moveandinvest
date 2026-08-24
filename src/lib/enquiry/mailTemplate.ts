// The one email layout, in two renderings: HTML and its plain-text twin.
//
// Table layout and inline styles only, and the reason is specific rather than
// superstitious: Outlook for Windows renders email HTML through Word's
// engine, not a browser engine. So, deliberately absent —
//
//   * flexbox and grid — no support at all in that engine; every layout
//     decision below is a <table>;
//   * CSS custom properties — unsupported there and stripped by some webmail
//     proxies, so every colour here is a literal, not a token reference. The
//     literals are copied from src/styles/_tokens.scss and the token name is
//     written beside each one, because a palette change has to be able to
//     find them;
//   * modern selectors and nesting — no client parses them reliably;
//   * web fonts — blocked or unsupported nearly everywhere, so both stacks
//     below are system faces.
//
// No logo image. The sibling project attaches one as a CID inline image, and
// its reasoning is right — a remote <img> is blocked by default on first
// open, an embedded one is not. But this project has no email logo asset and
// inventing one to fill a slot is not a reason to have the slot. The wordmark
// is set as text, which no client can block.
//
// role="presentation" on every layout table: a screen reader should skip
// these as layout rather than announce them as data.

const HEADING_FONT = "Georgia, 'Times New Roman', Times, serif";
const BODY_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO_FONT = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

const COLOR_BG = "#f4f5f7"; // the ground behind the card
const COLOR_CARD = "#ffffff"; // --color-surface
const COLOR_HEADER = "#0b0f16"; // --color-dark, the black plane
const COLOR_ACCENT = "#7a2230"; // --color-accent, oxblood
const COLOR_ACCENT_ON_DARK = "#c9646f"; // --color-accent-on-dark
const COLOR_INK = "#0e1420"; // --color-text
const COLOR_MUTED = "#5a6478"; // --color-text-muted
const COLOR_HAIRLINE = "#dce0e7"; // --color-hairline
const COLOR_QUIET_BG = "#faf7f7"; // --color-row-hover

export interface EmailBlock {
  heading?: string;
  /** Each line is either free text or a labelled value. */
  lines: (string | { label: string; value: string })[];
}

/** One link, under the paragraphs. Deliberately not a "button": a coloured
 *  table cell with white text is the first thing a spam filter reads as
 *  marketing, and the only email on this site that carries a link is the
 *  quietest one we send. It is an underlined text link with the bare URL
 *  printed under it, so it still works in the client that strips anchors and
 *  in the client that shows the plain-text part. */
export interface EmailLink {
  label: string;
  /** Absolute. A relative href in an email resolves against nothing. */
  href: string;
}

export interface EmailContent {
  heading: string;
  openingLine: string;
  bodyParagraphs?: string[];
  /** Rendered after the paragraphs, before the blocks. */
  link?: EmailLink;
  /** The block that carries the substance. Rendered on a tinted panel. */
  primaryBlock?: EmailBlock;
  /** Quieter, below, for context about the submission rather than the person. */
  secondaryBlock?: EmailBlock;
  /** One line under everything. The legal footing, not a signature. */
  footNote: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// A visitor's own words can contain newlines. They are meaningful — someone
// describing their situation in three paragraphs meant three paragraphs — so
// they survive into the HTML rather than collapsing into one run-on line.
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function renderBlockHtml(block: EmailBlock, tinted: boolean): string {
  const rows = block.lines
    .map((line) => {
      if (typeof line === "string") {
        return `<tr><td style="padding:0 0 10px;font-family:${BODY_FONT};font-size:15px;line-height:1.55;color:${COLOR_INK};">${escapeMultiline(line)}</td></tr>`;
      }
      return `<tr><td style="padding:0 0 10px;font-family:${BODY_FONT};font-size:15px;line-height:1.55;color:${COLOR_INK};"><span style="font-family:${MONO_FONT};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${COLOR_MUTED};">${escapeHtml(line.label)}</span><br>${escapeMultiline(line.value)}</td></tr>`;
    })
    .join("");

  const heading = block.heading
    ? `<tr><td style="padding:0 0 14px;font-family:${MONO_FONT};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${COLOR_ACCENT};">${escapeHtml(block.heading)}</td></tr>`
    : "";

  const cellStyle = tinted
    ? `padding:24px;background-color:${COLOR_QUIET_BG};`
    : `padding:24px 0 0;border-top:1px solid ${COLOR_HAIRLINE};`;

  return `<tr><td style="${cellStyle}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${heading}${rows}</table></td></tr>`;
}

export function renderEmailHtml(content: EmailContent): string {
  const paragraphs = (content.bodyParagraphs ?? [])
    .map(
      (text) =>
        `<tr><td style="padding:0 0 16px;font-family:${BODY_FONT};font-size:15px;line-height:1.65;color:${COLOR_INK};">${escapeMultiline(text)}</td></tr>`,
    )
    .join("");

  const link = content.link
    ? `<tr><td style="padding:4px 0 20px;font-family:${BODY_FONT};font-size:15px;line-height:1.65;"><a href="${escapeHtml(content.link.href)}" style="color:${COLOR_ACCENT};text-decoration:underline;">${escapeHtml(content.link.label)}</a><br><span style="font-family:${MONO_FONT};font-size:12px;color:${COLOR_MUTED};">${escapeHtml(content.link.href)}</span></td></tr>`
    : "";

  const primary = content.primaryBlock ? renderBlockHtml(content.primaryBlock, true) : "";
  const secondary = content.secondaryBlock ? renderBlockHtml(content.secondaryBlock, false) : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(content.heading)}</title></head>
<body style="margin:0;padding:0;background-color:${COLOR_BG};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${COLOR_BG};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:${COLOR_CARD};">
      <tr><td style="padding:22px 24px;background-color:${COLOR_HEADER};font-family:${HEADING_FONT};font-size:17px;letter-spacing:0.01em;color:#ffffff;">move<span style="color:${COLOR_ACCENT_ON_DARK};">&amp;</span>invest</td></tr>
      <tr><td style="padding:32px 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding:0 0 6px;font-family:${HEADING_FONT};font-size:24px;line-height:1.2;color:${COLOR_INK};">${escapeHtml(content.heading)}</td></tr>
          <tr><td style="padding:0 0 20px;font-family:${BODY_FONT};font-size:15px;line-height:1.6;color:${COLOR_MUTED};">${escapeMultiline(content.openingLine)}</td></tr>
          ${paragraphs}${link}
        </table>
      </td></tr>
      <tr><td style="padding:4px 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${primary}${secondary}</table>
      </td></tr>
      <tr><td style="padding:28px 24px 32px;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:${COLOR_MUTED};border-top:1px solid ${COLOR_HAIRLINE};">${escapeMultiline(content.footNote)}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// The plain-text twin, and it is a twin rather than a fallback: some clients
// show it by preference, some spam filters weigh a missing text part against
// you, and it is what a screen reader gets in the simplest clients.
export function renderEmailText(content: EmailContent): string {
  const out: string[] = ["move&invest", "", content.heading, "", content.openingLine];

  for (const p of content.bodyParagraphs ?? []) out.push("", p);

  if (content.link) out.push("", `${content.link.label}:`, content.link.href);

  for (const block of [content.primaryBlock, content.secondaryBlock]) {
    if (!block) continue;
    out.push("", "—".repeat(40));
    if (block.heading) out.push(block.heading.toUpperCase(), "");
    for (const line of block.lines) {
      out.push(typeof line === "string" ? line : `${line.label}: ${line.value}`);
    }
  }

  out.push("", "—".repeat(40), content.footNote);
  return out.join("\n");
}
