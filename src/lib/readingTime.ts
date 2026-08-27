/** Minutes, rounded up, never zero. */
export function readingTimeMinutes(body: unknown, wordsPerMinute = 200): number {
  const words = countWords(body);
  return Math.max(1, Math.round(words / wordsPerMinute));
}

// COUNTED FROM PORTABLE TEXT, NOT FROM RENDERED HTML, because there is no
// rendered HTML at the point this runs — the page needs the number in its own
// head, before anything is drawn.
//
// 200 words a minute rather than the 238 that gets quoted from Brysbaert's
// meta-analysis of silent reading. That figure is for continuous prose read for
// comprehension in the reader's first language. This is legal material with
// figures in it, and a good part of the audience is reading it in their second
// or third language. A number that flatters the page is worse than no number:
// its whole job is to let someone decide whether they have time now.
//
// Deliberately not shown for anything under a minute — see the max above. An
// entry marked "0 min" reads as an error, and one marked "1 min" is honest
// about a short piece.
function countWords(value: unknown): number {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  }

  if (Array.isArray(value)) {
    return value.reduce<number>((total, item) => total + countWords(item), 0);
  }

  if (value && typeof value === "object") {
    const node = value as Record<string, unknown>;

    // An image contributes its alt text and nothing else: a reader does not
    // read a photograph for a minute, and counting a caption as prose would
    // inflate a picture-heavy entry.
    if (node._type === "image") return 0;

    // Only the text-bearing parts of a block. Walking every key would count
    // marks, keys and style names as words.
    if (Array.isArray(node.children)) return countWords(node.children);
    if (typeof node.text === "string") return countWords(node.text);
  }

  return 0;
}
