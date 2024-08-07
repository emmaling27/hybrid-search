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

export const fullTextSearch = query({
  args: {
    query: v.string(),
    cuisine: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.runQuery(
      app.hybrid_search.text_search.fullTextSearch,
      {
        query: args.query,
        filterField: args.cuisine,
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
  args: {
    query: v.string(),
    cuisine: v.optional(v.string()),
    semanticRatio: v.optional(v.float64()),
  },
  handler: async (ctx, { query, cuisine, semanticRatio }) => {
    let results = await ctx.runAction(app.hybrid_search.hybrid.hybridSearch, {
      query,
      filterField: cuisine,
      semanticRatio,
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
