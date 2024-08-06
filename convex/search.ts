import { action, app } from "./_generated/server";
import { v } from "convex/values";

export const vectorSearch = action({
  args: { query: v.string(), cuisines: v.optional(v.array(v.string())) },
  handler: async (ctx, { query, cuisines }) => {
    return await ctx.runAction(app.hybrid_search.vector_search.vectorSearch, {
      query,
      filterField: cuisines,
    });
  },
});
