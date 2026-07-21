# Quality and architecture fixes

## P0 — no automated regression suite exists

`vp test` exits with code 1 because no test files are found. The project already has Vitest and Testing Library dependencies, but no configured test coverage.

**Start with high-value module interface tests:**

- Delivery creation: empty line items, zero/negative quantity, missing material, calculated-unit mismatch, supplier-local mixing, required supplier, duplicate material aggregation, and stock update.
- Inventory usage: insufficient stock, successful outgoing movement, and reversal/adjustment once implemented.
- Unit/supplier/material name normalization and duplicate rejection.
- The quick-action route contract and basic form pending/error states.

Run `vp test` and `vp check` in CI after these tests exist.

## P1 — formatting ownership is unclear

`vp check` reports formatting problems in 24 files, including `convex/_generated/*` and `src/components/ui/*`. Generated files should normally be regenerated, not manually formatted; vendored/generated UI code needs an intentional ownership policy.

**Fix:** run `vp check --fix` only after reviewing its diff, then configure formatter ignores for generated artifacts if they are regenerated externally. Keep project-owned UI code formatted and ensure `vp check` is clean in CI. Update the README to use the repository's required `vp` commands instead of the stale Bun/TanStack Start template.

## P1 — domain language and architecture decisions are undocumented

There is no `CONTEXT.md` or ADR directory. Yet terms such as `calculated`, `log_only`, `supplier_local`, `delivery`, `usage`, and `currentStock` carry business invariants.

**Fix:** add a lightweight `CONTEXT.md` documenting each term and its invariants, particularly what counts toward stock and how units behave. Add ADRs when deciding the inventory ledger/projection strategy, authentication scope, and unit conversion policy. This makes the Inventory Movement module's interface understandable without reading every caller.

## P2 — seed mutations are public and non-idempotent

`materials.seed`, `units.seed`, and `suppliers.seed` are public mutations. Units/suppliers seed blindly inserts duplicate records; materials seed only checks whether *any* material exists. They are not a safe operational migration interface.

**Fix:** move seed data to an admin-only/internal development workflow, make it explicitly idempotent if retained, and never expose it to ordinary clients.

## P2 — root setup relies on an unsafe environment cast

[`src/router.tsx`](../src/router.tsx) uses `(import.meta as any).env.VITE_CONVEX_URL!`. It logs a missing value but still constructs the client.

**Fix:** add typed Vite environment declarations and fail fast with a user-friendly configuration screen or startup error. This turns a late, opaque network failure into a small, well-defined interface.
