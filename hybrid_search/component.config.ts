import { defineComponent } from "convex/server";
import { v } from "convex/values";
export default defineComponent("hybrid_search", {
  args: { openAiKey: v.string(), vectorSearchRatio: v.float64() },
});
