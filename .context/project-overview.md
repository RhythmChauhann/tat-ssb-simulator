# Project Overview: TAT SSB Simulator

## Purpose
Simulate the **Thematic Apperception Test (TAT)** as administered in **Services Selection Board (SSB)** interviews for Indian Armed Forces officer candidates.

## What It Does
- Loads a PDF (`tat.pdf`) containing 12+ ambiguous images via PDF.js (CDN)
- Runs a **strictly timed 12-picture sequence** matching official SSB protocol:
  1. **5s** — "Get Ready"
  2. **11 cycles** of: **30s Observe** → **240s Write Story**
  3. **30s** — Blank Slide
  4. **240s** — Final Story Writing
- Fullscreen mode during test (prevents distraction)
- **Review Menu** unlocked after first completion — click any picture to re-view

## Out of Scope
- Story evaluation/scoring (human assessor task)
- User accounts, persistence, or results export
- Mobile-specific layouts (desktop-first, fullscreen-centric)
- Offline/PWA support

## Tech Stack
| Layer | Choice |
|-------|--------|
| Runtime | Browser (static HTML) |
| PDF Rendering | PDF.js v3.11.174 (CDN) |
| Styling | Inline CSS (no framework) |
| Logic | Vanilla JS (ES2017+, single `<script>`) |
| Deploy | Vercel static hosting |
| Config | `vercel.json` (cleanUrls, trailingSlash) |

## Key Constraints
- **Must be served over HTTP(S)** — `file://` blocks PDF.js CORS
- **No build step** — edit `index.html` directly
- **Single-file architecture** — all HTML/CSS/JS in `index.html`
- **PDF must have ≥12 pages** — random selection without replacement