# TAT SSB Simulator — Agent Instructions

## Project Overview
Single-page static site simulating the Thematic Apperception Test (TAT) for SSB (Services Selection Board). Loads `tat.pdf` via PDF.js (CDN), displays 12 timed picture prompts with observe/write phases, and provides a review menu.

## Key Files
- `index.html` — entire app (HTML, CSS, JS inline). Entry point.
- `tat.pdf` — source images (12+ pages), loaded at `PDF_PATH = "tat.pdf"`.
- `vercel.json` — Vercel deploy config (cleanUrls: false, trailingSlash: false).

## Running Locally
No build step. Serve the directory with any static server:
```bash
npx serve .
# or
python3 -m http.server 8000
```
Open `http://localhost:8000`. **Must be served over HTTP(S)** — `file://` protocol blocks PDF.js from loading `tat.pdf` due to CORS.

## Development Notes
- **No package.json, no node_modules, no build tooling.**
- PDF.js loaded from CDN: `cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`
- All logic in `<script>` tag at bottom of `index.html`.
- Timer phases: 5s get ready → 11×(30s observe + 240s write) → 30s blank → 240s final write.
- Review menu unlocks only after completing one full test (`testCompletedOnce` flag).
- Fullscreen API used on test start; exits on completion/stop.

## Common Tasks
| Task | Command |
|------|---------|
| Preview locally | `npx serve .` |
| Deploy | Push to Vercel (auto-deploys from `vercel.json`) |
| Update PDF | Replace `tat.pdf` (ensure ≥12 pages) |
| Modify timers | Edit `countdown()` calls in startBtn handler |

## Gotchas
- **CORS**: Never open `index.html` directly via `file://`. Always use a local server.
- **PDF path**: `PDF_PATH` is relative to the served root. If hosting in a subpath, update it.
- **PDF.js version**: Pinned to 3.11.174 in the script tag. Update URL if upgrading.
- **No tests/lint/typecheck** — this is a zero-config static project.