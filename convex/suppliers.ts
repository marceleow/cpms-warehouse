import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("suppliers").collect();
  },
});

export const getById = query({
  args: {
    id: v.id("suppliers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("suppliers")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      throw new ConvexError("Nama supplier sudah ada.");
    }
    return await ctx.db.insert("suppliers", { name: args.name });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const data = ["Bu Rodiyah", "PT. Andesuba", "Putra Jaya Mandiri", "PT. Menuba Prakarsa Beton"];

    for (const name of data) {
      await ctx.db.insert("suppliers", {
        name,
      });
    }

    return { inserted: data.length };
  },
});
