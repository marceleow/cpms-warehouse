// convex/materialUsages.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const usageItemArgs = v.object({
  materialId: v.id("materials"),
  quantity: v.number(),
  unit: v.string(),
});

export const create = mutation({
  args: {
    houseUnitId: v.id("units"),
    takenBy: v.string(),
    note: v.optional(v.string()),
    items: v.array(usageItemArgs),
  },
  handler: async (ctx, args) => {
    const takenBy = args.takenBy.trim();
    if (!takenBy) {
      throw new ConvexError("Nama pengambil wajib diisi.");
    }

    if (args.items.length === 0) {
      throw new ConvexError("Minimal harus ada 1 item material.");
    }

    for (const item of args.items) {
      if (item.quantity <= 0) {
        throw new ConvexError("Quantity harus lebih dari 0.");
      }
    }

    const houseUnit = await ctx.db.get(args.houseUnitId);
    if (!houseUnit) {
      throw new ConvexError("Unit rumah tidak ditemukan.");
    }

    const materials = await Promise.all(
      args.items.map(async (item) => {
        const material = await ctx.db.get(item.materialId);
        if (!material) {
          throw new ConvexError("Material tidak ditemukan.");
        }
        return material;
      }),
    );

    // validasi unit terkunci untuk material calculated
    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      const material = materials[i];
      if (material.trackingMode === "calculated" && item.unit !== material.unit) {
        throw new ConvexError(
          `Satuan untuk "${material.name}" harus "${material.unit}", tidak bisa diubah.`,
        );
      }
    }

    // validasi stock cukup untuk material calculated
    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      const material = materials[i];
      if (material.trackingMode === "calculated") {
        const currentStock = material.currentStock ?? 0;
        if (currentStock < item.quantity) {
          throw new ConvexError(
            `Stock "${material.name}" tidak cukup. Sisa: ${currentStock} ${material.unit}.`,
          );
        }
      }
    }

    const usageId = await ctx.db.insert("materialUsages", {
      houseUnitId: args.houseUnitId,
      takenBy,
      note: args.note,
    });

    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      const material = materials[i];

      await ctx.db.insert("materialUsageItems", {
        usageId,
        materialId: item.materialId,
        quantity: item.quantity,
        unit: item.unit,
      });

      if (material.trackingMode === "calculated") {
        await ctx.db.patch(item.materialId, {
          currentStock: (material.currentStock ?? 0) - item.quantity,
        });
      }
    }

    return usageId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("materialUsages").order("desc").collect();
  },
});

export const listByHouseUnit = query({
  args: { houseUnitId: v.id("units") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materialUsages")
      .withIndex("by_house_unit", (q) => q.eq("houseUnitId", args.houseUnitId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("materialUsages") },
  handler: async (ctx, args) => {
    const usage = await ctx.db.get(args.id);
    if (!usage) return null;

    const items = await ctx.db
      .query("materialUsageItems")
      .withIndex("by_usage", (q) => q.eq("usageId", args.id))
      .collect();

    const itemsWithMaterial = await Promise.all(
      items.map(async (item) => ({
        ...item,
        material: await ctx.db.get(item.materialId),
      })),
    );

    const houseUnit = await ctx.db.get(usage.houseUnitId);

    return { ...usage, items: itemsWithMaterial, houseUnit };
  },
});
