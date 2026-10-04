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

## Saved data and Supabase

Likes, comments, shared places and taste results go through one data layer (`src/lib/backend.js`) with two implementations:

- **Local mode (default):** everything is saved in the visitor's own browser.
- **Supabase mode:** shared by every visitor. Turned on by filling in `src/data/config.js`.

To set up Supabase:

1. Create a project at https://supabase.com.
2. In **SQL Editor**, run the whole of `supabase/schema.sql`.
3. Copy the **Project URL** and **anon public** key from **Project Settings → API** into `src/data/config.js`.
4. Run `npm run export` and publish.

What the schema enforces:

- Row-level security on every table. Visitors can read public columns only; hidden columns (IP hash, client id) are not readable.
- No direct inserts. All writes go through `SECURITY DEFINER` functions that strip HTML and control characters, validate lengths, colours, foods and moods, and apply rate limits (3 comments per minute and 20 per hour, 3 places per hour, 12 taste results per 10 minutes, 30 likes per minute), keyed on a hash of the visitor's IP.
- Photos: a public `places` bucket that accepts only JPEG files up to 2 MB with a random UUID name, with a global limit of 10 uploads per minute.

On the client, photos are checked by their real file signature, size and dimensions, then re-encoded through a canvas, which strips EXIF data such as GPS location.

## Architecture

- **State → Actions → UI.** `src/lib/store.js` is a small store. `src/lib/app.js` holds the actions, the only code that calls the backend. Pages subscribe to the exact slice they render, so a like updates one button instead of redrawing the page.
- **Performance.** Each page is a separate module loaded on first visit. Images are lazy-loaded with fixed dimensions. Long sections use `content-visibility: auto`. Only the blog's featured photo is preloaded, and only when the blog is opened.

## Interactive features

- **Colour Journey** (`components/journey.js`): a hairline under the header that fills as you move from Culture to Place to Perception. Hover it to see the chapters.
- **Bahrain Colour Map** (`components/map.js`, `data/places.js`): landmark pins that reveal each place's palette, story and mood.
- **Scroll story** (`components/story.js`): the A'ali jar is built from earth, then life, then heritage as you scroll.
- **Palette lab** (blog): extracts five colours from a photo with k-means and reads their mood (`lib/palette.js`).
- **Blindfolded vs seeing the colour** (taste): log results in either mode and compare them in live charts.
- **Small touches:** hidden details on hover, statistics that count up as they appear, a "next discovery" suggestion based on the colours you notice, and a few secrets for curious visitors.

## Project structure

```
index.html
src/
  main.js              router + app start-up
  styles.css           Tailwind setup, theme colours, components
  components/          layout, page hero, jar and scene illustrations
  data/                all editable content
  lib/                 store, actions, backend, palette, motion, sanitising, UI helpers
  pages/               home, art, taste, blog
public/                favicon and photos
supabase/schema.sql    database schema, security rules and rate limits
```

## Standalone copy for GitHub Pages

`colours-matter-site/` is a no-build copy of the site: `index.html`, `css/style.css` and the JavaScript as readable ES modules. Push that folder as-is to any static host. After you change anything in `src/`, regenerate it with:

```bash
npm run export
```
