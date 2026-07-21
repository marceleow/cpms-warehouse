# Product and frontend fixes

## P0 — navigation exposes a route that does not exist

**Evidence:** [`QuickActionDrawer.tsx`](../src/components/QuickActionDrawer.tsx#L13) links to `/materials/inbound/supplier`; there is no matching route file.

**Fix:** either implement the local-supplier intake route/form (including supplier selection and `supplier_local` filtering) or remove/disable this action until it exists. A primary action that reaches 404 is a production blocker.

## P1 — several visible workflows are placeholders

The Dock exposes `/history` and `/stock`; both only return a hello message. Material detail, supplier detail, and material-out are also placeholders, while lists link to the first two.

**Fix:** choose one of these two coherent releases:

1. Build the workflows: stock view from the stock projection; history from immutable movements; material/supplier details with related records; outgoing material usage with inventory validation.
2. Hide incomplete navigation and list links until the relevant route provides user value.

The second choice reduces interface complexity immediately; the first should follow the inventory-module work in the data review.

## P1 — forms allow accidental repeat submissions and log user data

**Evidence:** the inbound form logs submission and validation data to the browser console in [`InboundMaterialForm.tsx`](../src/components/materials/InboundMaterialForm.tsx#L49) and lines 75–78. Its submit button is not disabled while the mutation is pending.

**Fix:** remove console logging, use `formState.isSubmitting` to disable the submit button, and give the user a clear pending label. Add an idempotency key to the Delivery interface if network retries or double taps must never create duplicate deliveries.

## P2 — browser form rules and server rules diverge

The client limits item units to `MATERIAL_UNITS`, while both `deliveryItems.unit` and `materialUsageItems.unit` accept arbitrary strings in the schema. Server validation only locks calculated units; the client filters inbound items to calculated/log-only but a direct call can bypass the UI.

**Fix:** explicitly decide whether non-calculated materials permit arbitrary units. If not, validate the shared unit union server-side. If yes, model a conversion or a documented `customUnit` path; do not have the browser be the only policy holder.

## P2 — route/layout polish is repetitive and has small accessibility defects

Headers are repeated across routes, the fixed Dock can overlap page content, and several icon-only buttons/links lack accessible names. The supplier search input is labeled/placeholdered as a unit search.

**Fix:** add a small Page Shell module that reserves bottom padding for the Dock and accepts title/back/action slots. Add `aria-label` values to icon-only controls and correct the supplier search copy. This is a deepening that reduces repeated layout decisions without over-abstracting page content.
