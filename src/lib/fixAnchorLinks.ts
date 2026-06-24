/**
 * fixAnchorLinks
 *
 * When TipTap (with tiptap-markdown + autolink) pastes markdown it sometimes
 * resolves `#heading` anchor links against the current page URL, producing:
 *
 *   <a href="https://claude.ai/chat/xxxxx#1-introduction">
 *
 * This utility restores them to plain hash links:
 *
 *   <a href="#1-introduction">
 *
 * It also:
 *  - Adds `id` attributes to headings so TOC links resolve correctly.
 *  - Adds `target="_blank" rel="noopener noreferrer"` to real external links.
 *  - Adds `word-break: break-word` style to links so they don't overflow on mobile.
 */
export function fixAnchorLinks(html: string): string {
  if (!html) return html;

  // ── Step 1: Restore incorrectly-absolutised anchor links ─────────────────
  // Matches href="https://anything#fragment" and keeps only "#fragment"
  // This handles Claude, GitHub, and any other source URL that got prepended.
  let fixed = html.replace(
    /href="https?:\/\/[^"#]*?(#[^"]+)"/gi,
    'href="$1"'
  );

  // ── Step 2: Add id attributes to headings (for TOC navigation) ───────────
  // Only add id if the heading doesn't already have one.
  fixed = fixed.replace(
    /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, content) => {
      // Already has an id — leave as-is
      if (/\bid\s*=/.test(attrs)) return match;

      // Strip inner HTML tags to get plain text for the id
      const text = content.replace(/<[^>]+>/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (!id) return match;
      return `<${tag} id="${id}"${attrs}>${content}</${tag}>`;
    }
  );

  // ── Step 3: Add target/rel to external links, word-break for mobile ───────
  fixed = fixed.replace(
    /<a\s([^>]*)href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    (match, before, href, after) => {
      const hasTarget = /target=/i.test(before + after);
      const targetAttr = hasTarget ? '' : ' target="_blank" rel="noopener noreferrer"';
      // Add word-break style for mobile overflow fix
      const hasStyle = /style=/i.test(before + after);
      const styleAttr = hasStyle ? '' : ' style="word-break:break-all"';
      return `<a ${before}href="${href}"${after}${targetAttr}${styleAttr}>`;
    }
  );

  return fixed;
}
