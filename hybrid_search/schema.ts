import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  table: defineTable({
    textField: v.string(),
    filterField: v.string(),
    embedding: v.array(v.float64()),
    parentId: v.optional(v.string()),
  })
    .searchIndex("full_text_search", {
      searchField: "textField",
      filterFields: ["filterField"],
    })
    .vectorIndex("vector_search", {
      vectorField: "embedding",
      dimensions: 1536, // TODO would be nice if this was available as an argument
      filterFields: ["filterField"],
    }),
});
