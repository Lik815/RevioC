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
 * Levenshtein distance between two strings (edit distance).
 * Used as a fuzzy matching fallback for typo tolerance.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(d[j] + 1, prev + 1, d[j - 1] + cost);
      d[j - 1] = prev;
      prev = val;
    }
    d[n] = prev;
  }
  return d[n];
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
 *   2 = fuzzy match (Levenshtein distance ≤ 2 on any word)
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

  // Fuzzy fallback: allow up to 2 edits for words of length >= 5
  if (query.length >= 5) {
    const maxDist = query.length >= 8 ? 2 : 1;
    if (words.some((w) => w.length >= 4 && levenshtein(w, query) <= maxDist)) return 2;
    if (levenshtein(normalized, query) <= maxDist) return 2;
  }

  return 0;
}

/**
 * Returns the best match score across a list of candidate strings.
 */
export function bestScore(candidates: string[], query: string): number {
  return Math.max(0, ...candidates.map((c) => scoreMatch(normalizeText(c), query)));
}
