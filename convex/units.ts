import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("units").collect();
  },
});

export const getById = query({
  args: {
    id: v.id("units"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("units")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      throw new ConvexError("Nama unit sudah ada.");
    }
    return await ctx.db.insert("units", { name: args.name });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const data = [
      "R01-01",
      "R01-03",
      "R01-02",
      "R01-06",
      "R01-12",
      "R01-05",
      "R01-07",
      "R01-08",
      "R01-10",
      "R01-16",
      "R02-10",
      "R01-18",
      "R01-38",
      "R01-50",
      "R01-29",
      "R01-31",
      "R01-33",
      "R01-36",
      "R02-02",
      "R02-25",
      "R02-06",
      "R02-08",
      "R02-12",
      "R02-16",
      "R02-18",
      "R02-20",
      "R02-26",
      "R02-28",
      "R02-27",
      "R02-30",
      "R03-01",
      "R03-02",
      "R03-06",
      "R03-03",
      "R03-09",
      "R03-05",
      "R03-07",
      "R03-08",
      "R03-10",
      "R03-18",
      "R03-19",
      "R03-21",
      "R03-23",
      "R03-31",
      "R03-33",
      "R03-35",
      "R03-36",
      "R05-02",
      "R05-06",
      "R05-08",
      "R05-10",
      "R06-05",
      "R06-07",
      "R06-09",
      "R06-11",
    ];

    for (const name of data) {
      await ctx.db.insert("units", {
        name,
      });
    }

    return { inserted: data.length };
  },
});
