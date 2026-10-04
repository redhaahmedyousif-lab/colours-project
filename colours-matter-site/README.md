# Colours Matter — Make an Impact

An MYP English Language & Literature project exploring how colour shapes culture, taste and everyday places in the Kingdom of Bahrain.

This folder is a ready-to-deploy static website: plain HTML, CSS and JavaScript, with no build step.

## Files

```
index.html          the page shell (fonts, theme, layout containers)
css/style.css       all styles (compiled Tailwind CSS)
js/main.js          start-up and page navigation
js/pages/           Home, Art, Taste and Blog pages
js/components/      header/footer, jar and place illustrations
js/data/            ALL the text and content (and config.js for Supabase)
supabase/schema.sql database tables, security rules and rate limits
js/lib/             helpers (saving, pop-ups, messages)
favicon.svg         browser tab icon
.nojekyll           tells GitHub Pages to serve files as they are
```

## Editing the content

Open the files in `js/data/` in any text editor:

- `site.js`: your name, school and unit.
- `art.js`: glazes, palette and presentation slides.
- `taste.js`: the foods and your experiment results. Replace the example `entries` with your real results, then set `isSampleData = false`.
- `blog.js`: the places, feelings and starter comments.

Change only the text between the quotes, keep the commas, and refresh the page.

## Previewing on your computer

Browsers block JavaScript modules on pages opened by double-click (`file://`), so run a tiny local server from this folder instead:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Sharing likes, comments and results between visitors (Supabase)

Out of the box everything visitors create is saved in their own browser. To share it with everyone:

1. Create a free project at https://supabase.com.
2. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql` and click **Run**.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. Paste both into `js/data/config.js` and publish the site again.

The anon key is meant to be public. Row-level security, server-side validation and rate limits in the schema protect the data.

## Notes

- Fonts load from Google Fonts. Without internet the page uses system fonts.
