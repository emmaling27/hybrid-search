import { defineComponent } from "convex/server";
import { v } from "convex/values";
export default defineComponent("hybrid_search", {
  args: {
    openAiKey: v.optional(v.string()),
    vectorSearchRatio: v.float64(),
    maxResults: v.float64(),
  },
});
