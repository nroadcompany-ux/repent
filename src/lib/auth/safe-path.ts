/**
 * Open-redirect guard for the post-authentication return path.
 *
 * Pure and dependency-free so it can be tested directly rather than inferred
 * from the shape of the calling code.
 *
 * The value is concatenated onto the site origin, so anything a browser could
 * read as a new authority must be rejected — not only `https://evil.example`
 * but the protocol-relative forms:
 *
 *   //evil.example        browsers resolve this against the current scheme
 *   /\evil.example        normalised to // by browsers
 *   /<TAB>/evil.example   control characters are stripped before resolution
 */

export const DEFAULT_RETURN_PATH = '/journey'

const MAX_LENGTH = 512

/** Space, C0 controls, DEL and C1 controls — all ignored by URL parsers. */
function isIgnorableForUrlParsing(codePoint: number): boolean {
  return codePoint <= 0x20 || codePoint === 0x7f || (codePoint >= 0x80 && codePoint <= 0x9f)
}

export function safeReturnPath(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null

  // Browsers strip whitespace and control characters while parsing a URL, so
  // remove them before deciding rather than after.
  const cleaned = Array.from(value)
    .filter((character) => !isIgnorableForUrlParsing(character.codePointAt(0) ?? 0))
    .join('')

  if (cleaned.length === 0 || cleaned.length > MAX_LENGTH) return null

  // Must be an absolute path on this site.
  if (!cleaned.startsWith('/')) return null

  // Reject anything introducing a new authority: // or /\ in either order.
  const second = cleaned[1]
  if (second === '/' || second === '\\') return null

  // A colon anywhere would let a scheme (javascript:, https:) slip in.
  if (cleaned.includes(':')) return null

  return cleaned
}
