/**
 * Export a standalone, no-build copy of the site for GitHub Pages.
 *
 *   npm run export   →   colours-matter-site/
 *
 * The output keeps the JavaScript as readable ES modules (no bundling) and
 * ships Tailwind as one compiled stylesheet, so the folder can be pushed to
 * any static host as-is.
 */
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'colours-matter-site';
const TMP = join('node_modules', '.export-tmp');

// 1. Compile the Tailwind stylesheet (unminified so it stays readable).
rmSync(TMP, { recursive: true, force: true });
execSync(`npx vite build --minify false --outDir ${TMP} --emptyOutDir`, { stdio: 'inherit' });
const cssFile = readdirSync(join(TMP, 'assets')).find((f) => f.endsWith('.css'));

// 2. Fresh output folder.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'css'), { recursive: true });

cpSync(join(TMP, 'assets', cssFile), join(OUT, 'css', 'style.css'));
cpSync('public', OUT, { recursive: true });
cpSync('src', join(OUT, 'js'), { recursive: true, filter: (src) => !src.endsWith('.css') });

// 3. The stylesheet is linked from the page, not imported from JS.
const mainPath = join(OUT, 'js', 'main.js');
writeFileSync(mainPath, readFileSync(mainPath, 'utf8').replace(/^import '\.\/styles\.css';\n/m, ''));

// 3b. Cache-busting: GitHub Pages lets browsers keep files for 10 minutes,
// so tag every local file with this export's version. Each new export then
// loads fresh files instead of a stale mix of old and new modules.
const VERSION = Date.now().toString(36);
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));
for (const file of walk(join(OUT, 'js')).filter((f) => f.endsWith('.js'))) {
  const src = readFileSync(file, 'utf8').replace(/(from\s+'\.{1,2}\/[^']+\.js)'/g, `$1?v=${VERSION}'`);
  writeFileSync(file, src);
}

// 4. Point index.html at the static files.
const html = readFileSync('index.html', 'utf8')
  .replace(
    '<link rel="icon"',
    `<link rel="stylesheet" href="./css/style.css?v=${VERSION}" />\n    <link rel="icon"`,
  )
  .replace('<script type="module" src="/src/main.js"></script>', `<script type="module" src="./js/main.js?v=${VERSION}"></script>`);
writeFileSync(join(OUT, 'index.html'), html);

// 5. Tell GitHub Pages to serve files as-is (skip Jekyll processing).
writeFileSync(join(OUT, '.nojekyll'), '');
cpSync(join('scripts', 'site-readme.md'), join(OUT, 'README.md'));

rmSync(TMP, { recursive: true, force: true });
console.log(`\n✓ Standalone site written to ${OUT}/`);
