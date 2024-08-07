import { HybridSearchResult } from "../hybrid_search/vector_search";
import { action, app } from "./_generated/server";
import { v } from "convex/values";

export const vectorSearch = action({
  args: { query: v.string(), cuisines: v.optional(v.array(v.string())) },
  handler: async (ctx, { query, cuisines }) => {
    let results = await ctx.runAction(
      app.hybrid_search.vector_search.vectorSearch,
      {
        query,
        filterField: cuisines,
      },
    );
    return results.map((result: HybridSearchResult) => {
      return {
        _id: result._id,
        description: result.textField,
        cuisine: result.filterField,
        _score: result._score,
      };
    });
  },
});

export const hybridSearch = action({
  args: { query: v.string(), cuisine: v.optional(v.string()) },
  handler: async (ctx, { query, cuisine }) => {
    let results = await ctx.runAction(app.hybrid_search.hybrid.hybridSearch, {
      query,
      filterField: cuisine,
    });
    return results.map((result: HybridSearchResult) => {
      return {
        _id: result._id,
        description: result.textField,
        cuisine: result.filterField,
        _score: result._score,
      };
    });
  },
});
