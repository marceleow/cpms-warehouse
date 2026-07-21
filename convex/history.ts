// convex/history.ts
import { v } from "convex/values";
import { query } from "./_generated/server";

type HistoryEntry = {
  _id: string;
  _creationTime: number;
  type: "in" | "out";
  status?: "pending_document" | "complete"; // cuma relevan buat "in"
  primaryLabel: string; // supplier/container source, atau house unit code
  secondaryLabel: string; // ringkasan item, e.g. "3 items: Keramik, Besi, +1 more"
  meta: string; // "taken by X" atau kosong
};

export const list = query({
  args: {
    type: v.optional(v.union(v.literal("all"), v.literal("in"), v.literal("out"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const type = args.type ?? "all";
    const search = args.search?.trim().toLowerCase();

    const entries: HistoryEntry[] = [];

    // --- Material In (deliveries) ---
    if (type === "all" || type === "in") {
      const deliveries = await ctx.db.query("deliveries").order("desc").collect();

      for (const delivery of deliveries) {
        const items = await ctx.db
          .query("deliveryItems")
          .withIndex("by_delivery", (q) => q.eq("deliveryId", delivery._id))
          .collect();

        const materials = await Promise.all(items.map((item) => ctx.db.get(item.materialId)));

        const materialNames = materials
          .map((m) => m?.name)
          .filter((name): name is string => !!name);

        const supplier = delivery.supplierId ? await ctx.db.get(delivery.supplierId) : null;
        const primaryLabel = supplier ? supplier.name : "Container Delivery";

        entries.push({
          _id: delivery._id,
          _creationTime: delivery._creationTime,
          type: "in",
          status: delivery.status,
          primaryLabel,
          secondaryLabel: formatItemSummary(materialNames),
          meta: "",
        });
      }
    }

    // --- Material Out (materialUsages) ---
    if (type === "all" || type === "out") {
      const usages = await ctx.db.query("materialUsages").order("desc").collect();

      for (const usage of usages) {
        const items = await ctx.db
          .query("materialUsageItems")
          .withIndex("by_usage", (q) => q.eq("usageId", usage._id))
          .collect();

        const materials = await Promise.all(items.map((item) => ctx.db.get(item.materialId)));

        const materialNames = materials
          .map((m) => m?.name)
          .filter((name): name is string => !!name);

        const houseUnit = await ctx.db.get(usage.houseUnitId);

        entries.push({
          _id: usage._id,
          _creationTime: usage._creationTime,
          type: "out",
          primaryLabel: houseUnit?.name ?? "Unknown Unit",
          secondaryLabel: formatItemSummary(materialNames),
          meta: `Taken by ${usage.takenBy}`,
        });
      }
    }

    // sort gabungan berdasarkan waktu terbaru
    entries.sort((a, b) => b._creationTime - a._creationTime);

    // filter search (nama material atau nama orang/unit) di level hasil gabungan
    const filtered = search
      ? entries.filter(
          (e) =>
            e.primaryLabel.toLowerCase().includes(search) ||
            e.secondaryLabel.toLowerCase().includes(search) ||
            e.meta.toLowerCase().includes(search),
        )
      : entries;

    return filtered;
  },
});

function formatItemSummary(names: string[]): string {
  if (names.length === 0) return "No items";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")}, +${names.length - 2} more`;
}
