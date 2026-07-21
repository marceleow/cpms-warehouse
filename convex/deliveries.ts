import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    supplierId: v.optional(v.id("suppliers")),
    attachmentStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        materialId: v.id("materials"),
        quantity: v.number(),
        unit: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) {
      throw new ConvexError("Minimal harus ada 1 item material.");
    }

    for (const item of args.items) {
      if (item.quantity <= 0) {
        throw new ConvexError("Quantity harus lebih dari 0.");
      }
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

    const hasSupplierMaterial = materials.some((m) => m.trackingMode === "supplier_local");
    const hasNonSupplierMaterial = materials.some((m) => m.trackingMode !== "supplier_local");

    if (hasSupplierMaterial && hasNonSupplierMaterial) {
      throw new ConvexError(
        "Tidak bisa gabung material supplier lokal dengan material lain dalam satu pengiriman.",
      );
    }

    if (hasSupplierMaterial && !args.supplierId) {
      throw new ConvexError("Supplier wajib dipilih untuk material supplier lokal.");
    }

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

    const deliveryId = await ctx.db.insert("deliveries", {
      supplierId: args.supplierId,
      attachmentStorageId: args.attachmentStorageId,
      status: args.attachmentStorageId ? "complete" : "pending_document",
      notes: args.notes,
    });

    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      const material = materials[i];

      await ctx.db.insert("deliveryItems", {
        deliveryId,
        materialId: item.materialId,
        quantity: item.quantity,
        unit: item.unit,
      });

      if (material.trackingMode === "calculated") {
        await ctx.db.patch(item.materialId, {
          currentStock: (material.currentStock ?? 0) + item.quantity,
        });
      }
    }

    return deliveryId;
  },
});

export const attachDocument = mutation({
  args: {
    deliveryId: v.id("deliveries"),
    attachmentStorageId: v.id("_storage"),
    documentNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId);
    if (!delivery) {
      throw new ConvexError("Delivery tidak ditemukan.");
    }

    await ctx.db.patch(args.deliveryId, {
      attachmentStorageId: args.attachmentStorageId,
      status: "complete",
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("deliveries").order("desc").collect();
  },
});

export const listPendingDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("deliveries")
      .withIndex("by_status", (q) => q.eq("status", "pending_document"))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("deliveries") },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.id);
    if (!delivery) return null;

    const items = await ctx.db
      .query("deliveryItems")
      .withIndex("by_delivery", (q) => q.eq("deliveryId", args.id))
      .collect();

    const itemsWithMaterial = await Promise.all(
      items.map(async (item) => ({
        ...item,
        material: await ctx.db.get(item.materialId),
      })),
    );

    const supplier = delivery.supplierId ? await ctx.db.get(delivery.supplierId) : null;

    return { ...delivery, items: itemsWithMaterial, supplier };
  },
});
