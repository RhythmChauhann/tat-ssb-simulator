# Development Workflow & Rules

## Local Development
```bash
# Serve (required — file:// fails CORS)
npx serve .          # port 3000
# or
python3 -m http.server 8000
```
Open `http://localhost:3000` (or 8000). No hot reload — refresh manually.

## Change Types & Verification

| Change | Verify By |
|--------|-----------|
| Timer durations | Run test, watch `bigTimer` countdown |
| PDF swap | Replace `tat.pdf`, reload, confirm "TEST READY" |
| UI tweaks | Visual check in browser devtools |
| Logic edits | Full test run (11+ minutes) or add temporary `console.log` |

## Testing Protocol (Manual)
No automated tests exist. Validate changes with:
1. **Happy path**: Start → complete all 12 pictures → review menu opens
2. **Skip**: Press "Skip Timer" during observe/write → advances phase
3. **Stop**: Press "Stop Test" mid-test → shows "TEST STOPPED", unlocks review
4. **Re-run**: After stop/complete, "Start Test" resets state cleanly
5. **Review**: Click thumbnails → main canvas shows that picture

## Deployment
```bash
git push origin main  # Vercel auto-deploys from vercel.json
```
- Zero config beyond `vercel.json`
- No build step, no environment variables

## Git Discipline
- **Single-file commits** for `index.html` changes (easier bisect)
- **PDF commits separate** — large binary, avoid frequent replacement
- **No lint/format hooks** — none configured

## Debugging Tips
- **Console**: `pdfDoc`, `usedPages`, `testRunning` exposed globally (no modules)
- **Network tab**: Verify `tat.pdf` loads (200) and PDF.js CDN loads
- **Fullscreen API**: Fails silently if not user-initiated — "Start Test" button handles this

## Scaling Thresholds (Do Not Cross Without Refactor)
| Metric | Current | Refactor Trigger |
|--------|---------|------------------|
| JS lines | ~550 | >800 → split into `<script type="module">` + imports |
| CSS lines | ~330 | >500 → extract to `styles.css` |
| Timer phases | 5 hardcoded | >7 → data-driven phase array |
| PDF pages | 12+ | Dynamic page count from PDF metadata |

## Emergency Fixes
- **PDF not loading**: Check `PDF_PATH` matches deployed path; verify CORS headers
- **Timer drift**: `setInterval` is approximate — acceptable for this use case
- **Canvas blank**: `clearCanvas()` sets width/height to 0 — ensure `renderPage()` runs after