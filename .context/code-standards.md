# Code Standards & Conventions

## JavaScript (ES2017+)
- **No modules/imports** — all code in one `<script>` tag
- **`const`/`let` only** — no `var`
- **Arrow functions** for callbacks; `function` keyword for top-level named functions
- **Async/await** for all PDF.js promises — no `.then()` chains
- **DOM queries cached at top** — `document.getElementById()` once per element

## Naming
| Type | Convention | Example |
|------|------------|---------|
| Constants | `SCREAMING_SNAKE` | `PDF_PATH`, `totalPages` |
| State flags | `camelCase` + `Requested`/`Running`/`Once` | `skipRequested`, `testRunning` |
| Functions | `camelCase` verb | `renderPage`, `countdown`, `saveReview` |
| DOM elements | `camelCase` noun | `canvas`, `viewerMessage`, `bigTimer` |
| CSS classes | `kebab-case` | `.status-card`, `.timer-box` |

## CSS
- **Single `<style>` block** — no external stylesheets
- **BEM-ish** for component scoping: `.viewer`, `.viewer::before`, `.viewerMessage`
- **Custom properties** for theming (preferred over magic values):
  ```css
  :root {
    --bg-primary: #0f172a;
    --accent: #38bdf8;
    --card-bg: rgba(255,255,255,0.08);
  }
  ```
- **No `!important`** — specificity managed by order

## HTML Structure
- Semantic where practical: `<button>`, `<canvas>`, `<div role="region">`
- IDs match JS variable names (e.g., `id="pdfCanvas"` → `const canvas = ...`)
- No inline styles or event handlers — all in `<style>` / `<script>`

## PDF.js Usage
- **Version pinned** in script src: `3.11.174`
- **Scale constants** in render functions:
  - Display: `scale: 1.7`
  - Thumbnail: `scale: 0.5`
- **Error handling** — `loadPDF()` catches and shows "PDF NOT FOUND"

## Prohibited Patterns
- ❌ `document.write()`, `eval()`, `innerHTML` with user data
- ❌ Global pollution beyond necessary (`pdfDoc`, `usedPages`, flags)
- ❌ Blocking loops — timers use `setInterval` + Promise
- ❌ External dependencies beyond PDF.js CDN