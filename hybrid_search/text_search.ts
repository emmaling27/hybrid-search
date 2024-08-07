import { v } from "convex/values";
import { componentArg, query } from "./_generated/server";

export const fullTextSearch = query({
  args: {
    query: v.string(),
    filterField: v.optional(v.string()),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, { query, filterField, limit }) => {
    let maxResults = limit ?? componentArg(ctx, "maxResults");
    maxResults = Math.round(maxResults);
    return await ctx.db
      .query("table")
      .withSearchIndex("full_text_search", (q) => {
        const result = q.search("textField", query);
        if (filterField) {
          return result.eq("filterField", filterField);
        } else {
          return result;
        }
      })
      .take(maxResults);
  },
});
