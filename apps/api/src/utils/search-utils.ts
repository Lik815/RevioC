/**
 * Normalize text for search: lowercase, replace German umlauts, strip diacritics.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Tokenize text into searchable words (min 3 chars each).
 */
export function tokenize(text: string): string[] {
  return text
    .split(/[\s,\-–\/]+/)
    .map(normalizeText)
    .filter((t) => t.length > 2);
}

/**
 * Score how well a normalized candidate matches a normalized query.
 * Returns 0 if no match.
 *
 * Scale:
 *  10 = exact full match
 *   9 = exact word match
 *   7 = prefix of full string
 *   6 = prefix of any word
 *   4 = substring of full string
 *   3 = substring of any word
 *   0 = no match
 */
export function scoreMatch(normalized: string, query: string): number {
  if (!query) return 0;
  if (normalized === query) return 10;
  const words = normalized.split(/\s+/);
  if (words.some((w) => w === query)) return 9;
  if (normalized.startsWith(query)) return 7;
  if (words.some((w) => w.startsWith(query))) return 6;
  if (normalized.includes(query)) return 4;
  if (words.some((w) => w.includes(query))) return 3;
  return 0;
}

/**
 * Returns the best match score across a list of candidate strings.
 */
export function bestScore(candidates: string[], query: string): number {
  return Math.max(0, ...candidates.map((c) => scoreMatch(normalizeText(c), query)));
}
