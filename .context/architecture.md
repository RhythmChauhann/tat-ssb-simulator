# Architecture & Invariants

## System Boundary
```
┌─────────────────────────────────────────────────────┐
│                   index.html                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  HTML    │  │   CSS    │  │      JS          │  │
│  │ Structure│  │  Styles  │  │  (single module) │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   ┌──────────┐         ┌──────────┐
   │ tat.pdf  │         │ PDF.js   │
   │ (local)  │         │ (CDN)    │
   └──────────┘         └──────────┘
```

## Core Invariants
1. **Single PDF document** — `tat.pdf` is the sole image source
2. **12 unique pages per test** — `usedPages` array enforces no repeats
3. **Sequential timer phases** — each `countdown()` call blocks via `await`
4. **Fullscreen lock** — test cannot run without fullscreen; exits on stop/complete
5. **Review gating** — `testCompletedOnce` flag controls menu access

## State Machine
```
IDLE → GET_READY(5s) → [OBSERVE(30s) → WRITE(240s)]×11 → BLANK(30s) → FINAL_WRITE(240s) → DONE
                     ↑                                                      │
                     └────────────────── STOP (any phase) ────────────────┘
```

## Data Flow
```
PDF.js → pdfDoc (PDFDocumentProxy)
       → getPage(n) → PDFPageProxy
       → render({canvasContext, viewport}) → canvas bitmap
       → toDataURL() → review thumbnails (base64 PNG)
```

## Extension Points
| Need | Where to Modify |
|------|-----------------|
| Change timers | `countdown()` calls in `startBtn` handler |
| Add/remove pictures | Replace `tat.pdf` (≥12 pages) |
| Modify PDF source | Update `PDF_PATH` constant |
| Custom beep sound | `beep()` function (Web Audio API) |
| UI theming | `<style>` block CSS variables |

## Non-Goals (Explicit)
- Module splitting (single file is intentional for zero-config deploy)
- TypeScript / build tooling
- State persistence across sessions
- Multi-user or server-side logic