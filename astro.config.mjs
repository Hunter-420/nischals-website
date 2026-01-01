import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://hunter-420.github.io',
  base: '/nischals-website/', // IMPORTANT: for GitHub Pages project site
  build: {
    assets: 'assets', // Renames _astro to assets to avoid GitHub Pages ignoring it
  },
});
