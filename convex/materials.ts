// convex/seed.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { MATERIAL_UNITS } from "./constants";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("materials").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    unit: v.union(...MATERIAL_UNITS.map((u) => v.literal(u.value))),
    trackingMode: v.union(
      v.literal("calculated"),
      v.literal("log_only"),
      v.literal("supplier_local"),
    ),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) {
      throw new ConvexError("Nama material wajib diisi.");
    }

    const existingByName = await ctx.db
      .query("materials")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();
    if (existingByName) {
      throw new ConvexError("Nama material sudah ada.");
    }

    const code = args.code?.trim() || undefined;
    if (code) {
      const existingByCode = await ctx.db
        .query("materials")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (existingByCode) {
        throw new ConvexError("Kode material sudah dipakai material lain.");
      }
    }

    return await ctx.db.insert("materials", {
      name,
      code,
      description: args.description?.trim() || undefined,
      unit: args.unit,
      trackingMode: args.trackingMode,
      currentStock: args.trackingMode === "calculated" ? 0 : undefined,
    });
  },
});

const materials = [
  // ===== CALCULATED =====
  { name: "Semen Tiga Roda", unit: "sak", trackingMode: "calculated" },
  { name: "Semen Gresik", unit: "sak", trackingMode: "calculated" },
  { name: "Pasir Cor", unit: "m3", trackingMode: "calculated" },
  { name: "Pasir Pasang", unit: "m3", trackingMode: "calculated" },
  { name: "Batu Split", unit: "m3", trackingMode: "calculated" },
  { name: "Bata Merah", unit: "buah", trackingMode: "calculated" },
  { name: "Batako", unit: "buah", trackingMode: "calculated" },
  { name: "Bata Ringan", unit: "buah", trackingMode: "calculated" },
  { name: "Besi 8 mm", unit: "batang", trackingMode: "calculated" },
  { name: "Besi 10 mm", unit: "batang", trackingMode: "calculated" },
  { name: "Besi 12 mm", unit: "batang", trackingMode: "calculated" },
  { name: "Wiremesh M8", unit: "lembar", trackingMode: "calculated" },
  { name: "Triplek 9 mm", unit: "lembar", trackingMode: "calculated" },
  { name: "Triplek 12 mm", unit: "lembar", trackingMode: "calculated" },
  { name: "Kayu Balok", unit: "batang", trackingMode: "calculated" },
  { name: "Gypsum", unit: "lembar", trackingMode: "calculated" },
  { name: "Keramik 40x40", unit: "dus", trackingMode: "calculated" },
  { name: "Keramik 60x60", unit: "dus", trackingMode: "calculated" },
  { name: "Granit 60x60", unit: "dus", trackingMode: "calculated" },
  { name: "Pipa PVC 1/2", unit: "batang", trackingMode: "calculated" },
  { name: "Pipa PVC 3/4", unit: "batang", trackingMode: "calculated" },
  { name: "Kabel NYM", unit: "roll", trackingMode: "calculated" },
  { name: "Cat Interior", unit: "pail", trackingMode: "calculated" },
  { name: "Cat Exterior", unit: "pail", trackingMode: "calculated" },
  { name: "Waterproof", unit: "pail", trackingMode: "calculated" },

  // ===== LOG ONLY =====
  { name: "Paku 2 Inch", unit: "kg", trackingMode: "log_only" },
  { name: "Paku 3 Inch", unit: "kg", trackingMode: "log_only" },
  { name: "Sekrup Gypsum", unit: "dus", trackingMode: "log_only" },
  { name: "Dynabolt", unit: "buah", trackingMode: "log_only" },
  { name: "Mur Baut M12", unit: "buah", trackingMode: "log_only" },
  { name: "Ring Baut", unit: "buah", trackingMode: "log_only" },
  { name: "Elbow PVC", unit: "buah", trackingMode: "log_only" },
  { name: "Socket PVC", unit: "buah", trackingMode: "log_only" },
  { name: "Tee PVC", unit: "buah", trackingMode: "log_only" },
  { name: "Lem PVC", unit: "kaleng", trackingMode: "log_only" },
  { name: "Thinner", unit: "liter", trackingMode: "log_only" },
  { name: "Kuas 2 Inch", unit: "buah", trackingMode: "log_only" },
  { name: "Roll Cat", unit: "buah", trackingMode: "log_only" },
  { name: "Amplas", unit: "lembar", trackingMode: "log_only" },
  { name: "Lakban", unit: "roll", trackingMode: "log_only" },
  { name: "Cable Tie", unit: "dus", trackingMode: "log_only" },
  { name: "Stop Kontak", unit: "buah", trackingMode: "log_only" },
  { name: "Saklar", unit: "buah", trackingMode: "log_only" },
  { name: "MCB 6A", unit: "buah", trackingMode: "log_only" },
  { name: "Lampu LED", unit: "buah", trackingMode: "log_only" },
  { name: "Handle Pintu", unit: "set", trackingMode: "log_only" },
  { name: "Engsel Pintu", unit: "set", trackingMode: "log_only" },
  { name: "Kunci Pintu", unit: "set", trackingMode: "log_only" },
  { name: "Floor Drain", unit: "buah", trackingMode: "log_only" },
  { name: "Kran Air", unit: "buah", trackingMode: "log_only" },

  {
    name: "Keramik Roman dCaliza Beige 60x60",
    code: "ROM-DCB6060",
    description: "Keramik lantai motif batu alam ukuran 60x60 cm warna beige.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Keramik Roman dStone Grey 60x60",
    code: "ROM-DSG6060",
    description: "Keramik lantai finishing matte untuk area indoor.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Roman Granit Nero 80x80",
    code: "ROM-GRN8080",
    description: "Granit polished premium ukuran 80x80 cm.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Roman Wall Tile White Glossy 30x60",
    code: "ROM-WTG3060",
    description: "Keramik dinding glossy untuk kamar mandi dan dapur.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Niro Granite Marble White 60x60",
    code: "NIR-MW6060",
    description: "Granit motif marmer putih dengan finishing polished.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Niro Granite Concrete Grey 60x60",
    code: "NIR-CG6060",
    description: "Granit motif beton untuk area interior modern.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Platinum Ceramics Granite Ivory 60x60",
    code: "PLT-IV6060",
    description: "Granit warna ivory untuk ruang tamu dan kamar.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Platinum Ceramics Slate Grey 40x40",
    code: "PLT-SG4040",
    description: "Keramik lantai motif batu dengan permukaan anti slip.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Mulia Ceramics White Glossy 40x40",
    code: "MLA-WG4040",
    description: "Keramik lantai glossy warna putih.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "Mulia Ceramics Dark Grey 60x60",
    code: "MLA-DG6060",
    description: "Keramik lantai warna abu gelap bergaya minimalis.",
    trackingMode: "calculated",
    unit: "dus",
  },

  {
    name: "TOTO Closet Duduk CW421J",
    code: "TOTO-CW421J",
    description: "Closet duduk one piece dengan sistem dual flush.",
    trackingMode: "log_only",
    unit: "unit",
  },

  {
    name: "TOTO Wastafel LW248CJ",
    code: "TOTO-LW248CJ",
    description: "Wastafel keramik untuk kamar mandi.",
    trackingMode: "log_only",
    unit: "unit",
  },

  {
    name: "Dulux Weathershield Putih",
    code: "DLX-WS-20L",
    description: "Cat eksterior tahan cuaca kemasan 20 liter.",
    trackingMode: "calculated",
    unit: "pail",
  },

  {
    name: "Nippon Vinilex Putih",
    code: "NPP-VNX-5KG",
    description: "Cat interior berbahan dasar akrilik.",
    trackingMode: "calculated",
    unit: "pail",
  },

  {
    name: "Philips LED Bulb 12W",
    code: "PHL-LED12W",
    description: "Lampu LED hemat energi warna putih.",
    trackingMode: "log_only",
    unit: "buah",
  },
] as const;

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("materials").first();

    if (existing) {
      throw new Error("Materials sudah pernah di-seed.");
    }

    await Promise.all(
      materials.map((material) =>
        ctx.db.insert("materials", {
          ...material,
          ...(material.trackingMode === "calculated"
            ? {
                currentStock: Math.floor(Math.random() * 500) + 1,
              }
            : {}),
        }),
      ),
    );

    return {
      inserted: materials.length,
    };
  },
});
