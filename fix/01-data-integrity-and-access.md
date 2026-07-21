# Data integrity and access fixes

## P0 — a delivery with duplicate materials can undercount stock

**Evidence:** [`convex/deliveries.ts`](../convex/deliveries.ts) reads every line's material before the write loop (lines 28–36), then patches `currentStock` from that original value for every calculated line (lines 69–84).

If the same material has stock 10 and a delivery contains two lines of +2 and +3, both updates are calculated from 10. The last patch may leave stock at 13 instead of 15. The delivery-item records remain correct, but the material projection is wrong.

**Fix:** make the Delivery intake module aggregate items by `materialId` before writing. Reject duplicates in the interface, or create one delivery item per material with the summed quantity. Patch each material exactly once using the aggregate. Add a test for duplicate calculated lines.

**Why first:** `currentStock` is a derived operational fact used by the picker; once it is wrong, later usage records compound the discrepancy.

## P0 — public functions have no authorization or data ownership

**Evidence:** all queries and mutations in `convex/materials.ts`, `convex/deliveries.ts`, `convex/units.ts`, and `convex/suppliers.ts` are public and do not call `ctx.auth.getUserIdentity()`. The schema has no organisation/project/owner field.

Anyone able to use the deployed Convex endpoint can invoke exposed functions according to the deployment's access controls; there is no application-level check limiting reads or writes. This also means a future multi-project deployment has no seam for separating warehouses.

**Fix:** before a shared deployment, add `convex/auth.config.ts`, require an identity in each public Warehouse module, and introduce a project/organisation record. Attach its ID to every business document and query it through indexes such as `by_organisation_and_status`. Keep administrative seeding internal or remove it from production.

**Recommendation strength:** Strong for any environment beyond a trusted local prototype.

## P1 — the `documentNumber` input is silently discarded

**Evidence:** `attachDocument` accepts `documentNumber` in [`convex/deliveries.ts`](../convex/deliveries.ts#L91) but only persists storage ID and status (lines 103–106); the `deliveries` schema has no matching field.

**Fix:** either add an optional `documentNumber` field plus an appropriate lookup index if it must be unique/searchable, or remove it from the mutation interface. Do not keep a caller-visible parameter with no effect.

## P1 — stock is a fragile projection, not an auditable inventory ledger

**Evidence:** inbound delivery creation increases `materials.currentStock`, while `materialUsages`/`materialUsageItems` exist in the schema but no mutation or route records outgoing stock. There is no adjustment/reversal mechanism.

**Fix:** create one deep Inventory Movement module that accepts an idempotent movement command and atomically writes its immutable movement records plus the stock projection. It should own: calculated-material unit validation, non-negative-stock policy, duplicate aggregation, inbound/outbound/adjustment types, and reversal rules. The interface becomes the test surface; callers should not calculate stock themselves.

**Leverage:** locality for all inventory rules and an audit trail to rebuild or reconcile `currentStock`.

## P1 — name uniqueness is inconsistent and becomes slow as data grows

**Evidence:** materials use indexes for name/code, but Units and Suppliers scan tables with `.filter()` in [`convex/units.ts`](../convex/units.ts#L20) and [`convex/suppliers.ts`](../convex/suppliers.ts#L20). Neither trims or normalizes names, unlike material creation.

**Fix:** store a normalized name key (e.g. trimmed, case-folded) and index it. Validate it once in a small shared value-normalization module. Use the index for duplicate checks and optionally add a display-name sort index. Define whether `PT ABC` and `pt abc` are the same entity.
