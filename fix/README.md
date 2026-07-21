# Codebase review — CPMS Warehouse

Review date: 2026-07-20

This review covered the React/TanStack Router client, Convex schema and functions, build output, and the current validation setup. It does not assess production configuration, data already stored in Convex, or real user workflows.

## Priority order

1. Fix stock integrity and make stock movement an explicit module: [01-data-integrity-and-access.md](./01-data-integrity-and-access.md).
2. Complete or hide routes/actions that lead to placeholders or a missing route: [03-product-and-frontend.md](./03-product-and-frontend.md).
3. Add regression tests and restore a clean `vp check`: [04-quality-and-architecture.md](./04-quality-and-architecture.md).
4. Paginate lists and reduce repeated client/server work before data volume grows: [02-performance-and-scale.md](./02-performance-and-scale.md).

## Validation snapshot

| Command | Result |
| --- | --- |
| `vp install` | Passed; dependencies already current. |
| `vp build` | Passed; warning for a 520 kB minified main chunk (159 kB gzip). |
| `vp check` | Failed: formatting issues in 24 files, including generated and UI files. |
| `vp test` | Failed: no test files were found. |

## Suggested delivery sequence

First protect the inventory facts (deduplicate/aggregate line items, validate records, implement outgoing usage, then add authentication/authorization if this is more than a local prototype). Next remove broken navigation and fill the core detail/history/stock workflows. Finally establish tests, formatting ownership, and pagination. That order preserves the correctness of future data while keeping the changes easy to verify.
