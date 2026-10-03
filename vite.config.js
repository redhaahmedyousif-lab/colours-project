import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// `base: './'` keeps asset paths relative so the built site works from any
// sub-folder (e.g. GitHub Pages at /colours-project/) or straight from disk.
export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
});
