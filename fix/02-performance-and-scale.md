# Performance and scale fixes

## P1 — unbounded reactive queries will not scale

**Evidence:** `materials.list`, `units.list`, `suppliers.list`, `deliveries.list`, and `deliveries.listPendingDocuments` use `.collect()`. The client then downloads all master data and searches with Fuse.js locally.

This is reasonable for a small demo, but every added record increases reactive payload, browser memory, and client-side search work. Delivery history will grow indefinitely.

**Fix:** paginate history and delivery lists now using Convex `paginationOptsValidator` and `.paginate()`. For master data, start with a bounded, sorted list and introduce indexed server search once it can exceed a few hundred items. Avoid returning fields not needed for each list view.

## P2 — the material list creates a Fuse index on every render

**Evidence:** [`MaterialList.tsx`](../src/components/materials/MaterialList.tsx#L12) constructs `new Fuse(...)` each render. Unit and supplier lists do the same.

**Fix:** wrap the Fuse index and filtered results in `useMemo`, keyed by documents and search text. This is a small optimisation; pagination and server-side filtering are higher leverage.

## P2 — each inbound line subscribes to the full materials query

**Evidence:** `InboundMaterialForm` renders one `MaterialItemRow` per line, and each row calls `useQuery(api.materials.list)` in [`ItemRow.tsx`](../src/components/materials/ItemRow.tsx#L31). `MaterialPicker` also queries it.

**Fix:** load materials once in the form/container and pass the material map/list through a narrow interface to rows and picker. This improves locality and avoids redundant subscriptions, even if the client deduplicates some transport work.

## P2 — delivery detail has per-item database reads

**Evidence:** [`deliveries.getById`](../convex/deliveries.ts#L128) fetches each delivery item, then calls `ctx.db.get(item.materialId)` once per item.

**Fix:** it is acceptable for small deliveries, but cap/paginate items for unusually large documents and deduplicate material IDs before fetching. Return a view model specific to the detail screen rather than exposing an accidental join shape.

## P2 — initial JavaScript bundle needs a dependency audit

`vp build` succeeds but reports a 519.98 kB minified `index` chunk (159.54 kB gzip), over the 500 kB warning threshold. Route code splitting is already enabled; the remaining main chunk includes shared runtime/UI dependencies.

**Fix:** inspect the bundle with a visualizer before changing code. Keep developer tooling development-only, lazy-load infrequently used drawers/pickers if it materially reduces the entry chunk, and remove unused dependencies. Set a gzip budget in CI so a regression is explicit.
