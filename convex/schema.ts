import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  foods: defineTable({
    description: v.string(),
    cuisine: v.string(),
    embedding: v.array(v.float64()),
  })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["cuisine"],
    })
    .searchIndex("by_description", {
      searchField: "description",
      filterFields: ["cuisine"],
    }),
  movies: defineTable({
    genres: v.array(v.string()),
    id: v.float64(),
    overview: v.string(),
    poster: v.string(),
    release_date: v.float64(),
    title: v.string(),
  }),
});
