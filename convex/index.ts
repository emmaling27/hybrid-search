import { v } from "convex/values";
import { query, action, app } from "./_generated/server";
import { api } from "./_generated/api";
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

export const listMovies = query(async (ctx) => {
  return await ctx.db.query("movies").collect();
});

export const insertMovies = action({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.runQuery(api.index.listMovies);
    const data = movies.map((movie) => {
      return {
        textField: `${movie.title}: ${movie.overview}`,
        filterField: movie.genres[0],
        parentId: movie._id,
      };
    });
    await ctx.runAction(app.movies.vector_search.populateFrom, { data });
  },
});

export const list = query(async (ctx) => {
  return await ctx.runQuery(app.hybrid_search.vector_search.list, {});
});
