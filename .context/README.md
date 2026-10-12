# Context Index — TAT SSB Simulator

## Quick Navigation
| File | Purpose | Read When |
|------|---------|-----------|
| `project-overview.md` | What/why/tech stack | New to project |
| `architecture.md` | Invariants, state machine, data flow | Modifying logic/timers |
| `code-standards.md` | Naming, CSS, JS conventions | Editing `index.html` |
| `workflow.md` | Local dev, testing, deploy, debugging | Day-to-day work |

## 30-Second Onboarding
```bash
# 1. Serve locally (required)
npx serve .

# 2. Open browser
# http://localhost:3000

# 3. Click "Start Test" → fullscreen → timed sequence begins
```

## Key Files in Repo Root
```
tat-ssb-simulator/
├── index.html        # ← ENTIRE APP (HTML/CSS/JS)
├── tat.pdf           # ← 12+ page source images
├── vercel.json       # ← Deploy config
├── LICENSE           # ← MIT
└── .context/         # ← THIS FOLDER (documentation)
```

## Common Tasks Cheatsheet

| Task | Action |
|------|--------|
| Change observe time | Edit `await countdown(30)` in loop |
| Change write time | Edit `await countdown(240)` in loop |
| Add custom beep | Modify `beep()` function (Web Audio API) |
| Update PDF | Replace `tat.pdf` (must have ≥12 pages) |
| Theme colors | Edit CSS custom properties in `:root` |
| Deploy | `git push origin main` |

## Architectural Guardrails
- **Do not split `index.html`** — single file is a feature (zero-config deploy)
- **Do not add build tools** — contradicts project philosophy
- **Do not persist state** — session-only by design
- **Do not remove fullscreen** — core to test integrity

## When to Expand Context
Create new `.context/*.md` only when:
- Adding a second HTML page / entry point
- Introducing a build step or package.json
- Need to document a new subsystem (e.g., backend, auth)
- Team grows beyond 1-2 maintainers

---
*Last updated: 2026. Keep this index current — it's the map for everything else.*