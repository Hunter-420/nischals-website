'use client';

import { useEffect, useRef } from 'react';

interface ArticleContentProps {
  html: string;
  className?: string;
}

/**
 * Client-side article content renderer.
 *
 * Responsibilities:
 * 1. Renders sanitised HTML (anchor links already fixed server-side).
 * 2. Intercepts clicks on internal `#anchor` links for smooth scrolling.
 * 3. Adds `id` attributes to headings that are missing them so TOC links work.
 * 4. Supports SVG content rendering alongside text, images, and other media.
 */
export function ArticleContent({ html, className }: ArticleContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // ── 1. Ensure headings have id attributes ──────────────────────────────
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      if (!heading.id) {
        const id = heading.textContent
          ?.toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')   // strip special chars
          .replace(/\s+/g, '-')        // spaces → hyphens
          .replace(/-+/g, '-')         // collapse multiple hyphens
          .replace(/^-|-$/g, '');      // strip leading/trailing hyphens
        if (id) heading.id = id;
      }
    });

    // ── 2. Ensure embedded SVG elements have proper sizing ────────────────
    const svgElements = container.querySelectorAll('svg');
    svgElements.forEach((svg) => {
      // Ensure SVG is responsive
      if (!svg.getAttribute('class')) {
        svg.setAttribute('class', 'max-w-full h-auto my-4 rounded-lg border border-gray-200 ');
      }
      // Preserve aspect ratio
      if (!svg.hasAttribute('preserveAspectRatio')) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }
    });

    // ── 3. Smooth-scroll handler for internal anchor links ─────────────────
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Only intercept pure hash links (e.g. #1-introduction)
      if (href.startsWith('#')) {
        e.preventDefault();
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update URL without triggering a navigation
          history.pushState(null, '', href);
        }
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
