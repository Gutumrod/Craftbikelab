# Commander Plan — CraftBikeLab

Written by: Claude (Commander), Mac session, 2026-07-18
Status: planning only — no implementation done in this pass, prep for whoever picks this up next (Commander itself, or delegated per team-structure.md)

---

## Audit — actual current state (verified by reading code, not assumed)

`craftbikelab.com` has 7 routes in `web/app/`. Verified each one's real implementation:

| Route | Status | Backing |
|---|---|---|
| `/` (home) | **Legacy** | Static HTML via iframe (`legacy-html/Editfooter/index.html`) |
| `/shop` | **Legacy** | Static HTML via iframe (`Shop.html`) — **but the data layer already exists and is unused here** (see below) |
| `/news` | **Legacy** | Static HTML via iframe (`News.html`) — no Supabase schema exists for this at all |
| `/craft` | **Legacy** | Static HTML via iframe (`Craft.html`) — no Supabase schema exists for this at all |
| `/search` | **Real** | `SearchResultsClient` + `normalizeModelNameWithDB` (fitment engine, Supabase-backed) |
| `/trip` | **Real** | Full Supabase-backed (`trip_routes`, `trip_route_votes`), voting, submission form, admin approval — done per 2026-07-14 milestone |
| `/admin` | **Real** | `actions.ts` (513 lines, product review) + `trip-actions.ts` (130 lines, trip approval) — P4, done + deployed 2026-07-16 |

**Key finding:** `web/lib/shop-products.ts` already defines a full `AffiliateProduct` type + `getProductsForAdmin()` reading from the `affiliate_products`/`product_model_mapping` Supabase tables. It's already consumed by `/admin` (product review works today). **It is not consumed anywhere in `/shop`** — the public shop page still renders the old static HTML instead of the same data the admin already manages. This is the actual gap, more specific than "build a Shop page" — it's "wire the public Shop page to the data layer that already exists."

`engine/` (the original Python 500K-product AI pipeline — Gemini extraction, R2, async worker) hasn't been touched since the initial commit (`c305041`). Dormant, not part of current active work.

## Open question — do not guess

CEO-project-links.md (vault) mentions an in-progress requirements interview for expanding `/admin` into a full "ศูนย์สั่งการ" (command center) that can write Shop+Trip+News content directly. That interview's answers live in a Windows-only handoff path (`D:/AI-Workspace/agents/claude/handoff/2026-07-16-...`) not available on this Mac, and I have no record of what was actually decided. **Do not build News/Craft admin tooling from assumption** — either resume that interview (this repo's own convention plus the `discovery-interview` skill fits) or confirm scope with CEO before starting Phase 3/4 below.

---

## Phase 1 — Wire `/shop` to real data (highest priority, smallest gap)

Goal: stop serving static HTML on `/shop`; render from the same `affiliate_products` data `/admin` already manages.

- Build a public product grid component (can reuse patterns from `/trip`'s client component and from `AdminProductsClient.tsx` minus the admin controls)
- Add a public read function in `shop-products.ts` (or a sibling function) that only returns `status = 'active'` products — do not reuse `getProductsForAdmin()` directly, that one is admin-scoped
- Replace `web/app/shop/page.tsx`'s iframe body with the real page
- Keep `/search` fitment linking intact (products already carry `fitment: string[]`)
- Verify: real product count on `/shop` matches what `/admin` shows as `active`, RLS confirmed (public role should only ever see `active`, never `pending`/`archived`)

## Phase 2 — Decide fate of `/` (home)

Home is the last page still fully static and highest-traffic. Two options, needs a CEO call, not an assumption:
- (a) Keep static — it's a landing/nav page, low risk to leave as legacy HTML
- (b) Migrate to Next.js once Shop is real, so nav/hero can eventually surface live shop/trip content (e.g. featured products, top trip)

Do not start this phase without confirming (a) vs (b).

## Phase 3 — News schema + real page (needs interview first)

No Supabase table exists for News content at all today — this is a from-scratch schema design, not a data-wiring job like Shop was. Needs: content model (title/body/date/author/published flag), admin authoring flow scope (full CMS? or still hand-edited HTML pushed to Supabase?). **Blocked on the open question above.**

## Phase 4 — Craft schema + real page (needs interview first)

Same situation as News — no schema exists. Likely lower priority than News since it hasn't come up as often in recent sessions. **Blocked on the open question above.**

## Phase 5 — "ศูนย์สั่งการ" admin expansion

Only makes sense after Phases 1/3/4 give admin something real to write to for Shop/News/Craft (Trip already has it). Re-scope with CEO once Phase 1 ships and the News/Craft interview resumes.

## Not in scope right now

- `engine/` Python pipeline — dormant, no signal it's needed for the current direction (web-first, not bulk-import-first). Leave alone unless CEO says otherwise.
- Custom domain changes — already live at `craftbikelab.com`, no work needed here.

---

## Recommended immediate next step

Phase 1 only. It's the smallest, highest-value gap (data layer exists, just needs a public-facing consumer), and it doesn't block on the open interview question. Everything else waits.
