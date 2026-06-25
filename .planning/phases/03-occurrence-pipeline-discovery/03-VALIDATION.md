# Phase 3 — Validation Architecture

**Phase:** 03 — Occurrence Pipeline + Discovery
**Requirements:** DISC-01, DISC-04
**Created:** 2026-06-25

---

## Nyquist Validation Map

Each Phase 3 requirement maps to one or more verifiable assertions. The executor must confirm each assertion after plan execution.

---

### DISC-01 — User can see a list of wildlife species plausible for their current GPS location

| ID | Assertion | How to verify |
|----|-----------|--------------|
| V-DISC01-1 | GPS button exists on /discover page | Navigate to /discover; confirm "Use my location" button renders |
| V-DISC01-2 | Clicking GPS button triggers `navigator.geolocation.getCurrentPosition` | Browser devtools → confirm geolocation API called on click |
| V-DISC01-3 | Server converts lat/lng to 10km grid square without storing coordinates | Check Neon DB after GPS flow — no raw lat/lng columns exist in any table |
| V-DISC01-4 | Species list renders after GPS permission granted | Grant location → loading skeleton → species cards appear |
| V-DISC01-5 | Species list is non-empty for a UK location | Use coordinates 51.503, -0.1246 (central London) → ≥1 species returned |
| V-DISC01-6 | Error message shown when GPS is denied | Deny browser location permission → red error message appears below form |

---

### DISC-04 — User can enter a postcode to browse nearby species without sharing live GPS

| ID | Assertion | How to verify |
|----|-----------|--------------|
| V-DISC04-1 | Postcode input form exists on /discover page | Navigate to /discover; confirm text input and submit button render |
| V-DISC04-2 | Entering "SW1A 2AA" returns a species list | Submit postcode → loading skeleton → species cards appear |
| V-DISC04-3 | Invalid postcode shows user-friendly error | Submit "ZZZZZZ" → error message "Postcode not found — try a different one" |
| V-DISC04-4 | Server calls postcodes.io, not the client | Network tab in browser — no request from client to api.postcodes.io |
| V-DISC04-5 | Server returns grid square, not raw lat/lng, to client | Inspect /api/discover/postcode response — returns `{ gridSquare: "..." }` only |

---

### Ethics / Privacy Gates (carry-forward from RESP-03, RESP-04)

| ID | Assertion | How to verify |
|----|-----------|--------------|
| V-PRIV-1 | Raw GPS coordinates never written to any DB table | After GPS flow: `SELECT * FROM occurrences LIMIT 5` — no lat/lng columns |
| V-PRIV-2 | Raw GPS coordinates never appear in server logs | Run `npm run dev` with terminal open; trigger GPS flow; no lat/lng in stdout |
| V-ETHICS-1 | Restricted species excluded during season-lock window | Set server date to 2025-05-15; query grid square containing Corncrake → Corncrake absent from results |
| V-ETHICS-2 | Restricted species included outside season-lock window | Set server date to 2025-01-15; same query → Corncrake present if it has occurrence records |

---

### Architecture / Security Gates

| ID | Assertion | How to verify |
|----|-----------|--------------|
| V-ARCH-1 | Client never calls NBN Atlas | Browser network tab — no requests to records-ws.nbnatlas.org from client |
| V-ARCH-2 | All /api/discover/* routes require auth | `curl -X POST localhost:3000/api/discover -d '{"gridSquare":"TQ38"}'` without session cookie → 401 |
| V-ARCH-3 | `geodesy` not imported in any "use client" file | `grep -r "geodesy" src/components/ src/app/` → zero matches |
| V-ARCH-4 | On-demand cache works — second call skips NBN fetch | Log NBN fetch calls; call /api/discover for same grid square twice → NBN called once, not twice |

---

### Minimum Thresholds

| Metric | Threshold |
|--------|-----------|
| Species returned for "SW1A 2AA" (central London) | ≥ 5 species |
| Species returned for a rural postcode (e.g. "LA22 9QB" — Lake District) | ≥ 3 species |
| Response time for cache hit | < 500ms |
| Response time for cache miss (first NBN fetch) | < 10s |
| TypeScript errors (`npx tsc --noEmit`) | 0 |
| Build errors (`npm run build`) | 0 |

---

*Validation architecture: Phase 3 — 2026-06-25*
