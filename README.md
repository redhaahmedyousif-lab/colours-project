# Colours Matter — Make an Impact

A responsive web app for the MYP English Language & Literature unit **“Colours Matter — Make an Impact”**. It looks at how colour shapes culture, taste and everyday places in the Kingdom of Bahrain.

Built with **Vite**, **Tailwind CSS v4** and plain JavaScript modules. There's no framework and no backend.

## What's inside

| Page | Highlights |
| --- | --- |
| **Home** (`#/`) | Animated hero, an introduction to why colour matters, an interactive *Colour meanings explorer* (red, pearl white, emerald, warm brown, Gulf turquoise, desert gold) and cards linking to each project. |
| **Project 1 · Art** (`#/art`) | A showcase of the A'ali pottery jar with a live "re-glaze" demo, the village's cultural context and the pottery process, palette cards (emerald green, warm brown, terracotta, sand) with mood profiles and copyable hex codes, a slide-deck **presentation mode** (keyboard, swipe, full screen) and a reflection. |
| **Project 2 · Taste** (`#/taste`) | Question, hypothesis, method and variables. Five recoloured foods (blue machboos rice, green milk, purple eggs, pink hummus, black lemonade) with a natural/new colour switch. Stat tiles, a rating chart, a searchable and filterable **results log** with an *add observation* form, CSV export, and an evaluation whose conclusion is worked out from the data. |
| **Project 3 · Blog** (`#/blog`) | Photo cards for colourful places (Manama Souq, Bab Al Bahrain, the Pearling Path, Bahrain Fort, the Tree of Life, Al Fateh Grand Mosque, Jarada Island). You can filter by feeling, sort, and like posts. Each post opens with its palette and a **working comment section**. Visitors can **share their own place**, with an optional photo upload. |

Also included: a dark/light toggle (it remembers the visitor's choice and otherwise follows the system setting), smooth hash-based navigation that works on any static host, an accessible mobile menu, modal dialogs that trap keyboard focus, a skip link, and support for reduced-motion settings.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build in dist/
npm run preview   # serve the production build
```

The build uses relative paths, so you can upload the `dist/` folder to any static host: GitHub Pages, Netlify, Vercel, or a school web server.

## Make it yours

All the content lives in `src/data/`, separate from the code:

- `site.js`: your name, school and unit details (shown in the footer).
- `home.js`: the intro pillars, the colour meanings and the project cards.
- `art.js`: the glazes, palette, pottery process and **presentation slides**.
- `taste.js`: the foods, method and results log. **The log comes with example entries.** Replace `entries` with the reactions you actually recorded, then set `isSampleData = false` to remove the notice.
- `blog.js`: the blog posts and starter comments. To show a real photo instead of an illustration, put the image in `public/photos/` and add `image: './photos/your-photo.jpg'` (plus an `alt` description) to the post.

## About saved data

This is a static site, so comments, likes, shared places and new taste-test entries are saved **in each visitor's own browser** (with `localStorage`). Other people won't see them. To share comments between all visitors, replace the two functions in `src/lib/storage.js` with calls to a hosted database such as Firebase or Supabase. Nothing else needs to change.

## Project structure

```
index.html
src/
  main.js              router + app start-up
  styles.css           Tailwind setup, theme colours, components
  components/          layout, page hero, jar and scene illustrations
  data/                all editable content
  lib/                 DOM helpers, storage, toasts/modals
  pages/               home, art, taste, blog
public/favicon.svg
```

## Standalone copy for GitHub Pages

`colours-matter-site/` is a no-build copy of the site: `index.html`, `css/style.css` and the JavaScript as readable ES modules. Push that folder as-is to any static host. After you change anything in `src/`, regenerate it with:

```bash
npm run export
```
