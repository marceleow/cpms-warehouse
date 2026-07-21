import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { MATERIAL_UNITS } from "./constants";

export default defineSchema({
  units: defineTable({
    name: v.string(),
  }),
  materials: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    trackingMode: v.union(
      v.literal("calculated"),
      v.literal("log_only"),
      v.literal("supplier_local"),
    ),
    unit: v.union(...MATERIAL_UNITS.map((u) => v.literal(u.value))),
    currentStock: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_code", ["code"]),
  suppliers: defineTable({
    name: v.string(),
  }),
  deliveries: defineTable({
    supplierId: v.optional(v.id("suppliers")),
    attachmentStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("pending_document"), v.literal("complete")),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_supplier", ["supplierId"]),
  deliveryItems: defineTable({
    deliveryId: v.id("deliveries"),
    materialId: v.id("materials"),
    quantity: v.number(),
    unit: v.string(),
  })
    .index("by_delivery", ["deliveryId"])
    .index("by_material", ["materialId"]),
  materialUsages: defineTable({
    houseUnitId: v.id("units"),
    takenBy: v.string(),
    note: v.optional(v.string()),
  }).index("by_house_unit", ["houseUnitId"]),
  materialUsageItems: defineTable({
    usageId: v.id("materialUsages"),
    materialId: v.id("materials"),
    quantity: v.number(),
    unit: v.string(), // sama, bebas & bisa beda dari default
  })
    .index("by_usage", ["usageId"])
    .index("by_material", ["materialId"]),
});
