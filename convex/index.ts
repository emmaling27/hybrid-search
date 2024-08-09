import { v } from "convex/values";
import { query, action, app } from "./_generated/server";
import { HybridSearchResult } from "../hybrid_search/vector_search";

export type SearchResult = {
  _id: string;
  description: string;
  cuisine: string;
  _score: number;
};

export const populate = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.runAction(app.hybrid_search.vector_search.populate, {});
  },
});

export const insert = action({
  args: { cuisine: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runAction(app.hybrid_search.vector_search.insert, {
      textField: args.description,
      filterField: args.cuisine,
    });
  },
});

export const list = query(async (ctx) => {
  return await ctx.runQuery(app.hybrid_search.vector_search.list, {});
});
