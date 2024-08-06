import { v } from "convex/values";
import { query } from "./_generated/server";

export const fullTextSearch = query({
  args: {
    query: v.string(),
    filterField: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("table")
      .withSearchIndex("full_text_search", (q) => {
        const result = q.search("textField", args.query);
        if (args.filterField) {
          return result.eq("filterField", args.filterField);
        } else {
          return result;
        }
      })
      .collect();
  },
});
