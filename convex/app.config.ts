import { defineApp } from "convex/server";
import hybrid_search from "../hybrid_search/component.config";

const app = defineApp();
const foods = app.install(hybrid_search, {
  args: {
    openAiKey: process.env.OPENAI_KEY,
    vectorSearchRatio: 0.5,
    maxResults: 5,
  },
});
app.mount({ foods: foods.exports as any });
const movies = app.install(hybrid_search, {
  name: "movies",
  args: {
    openAiKey: process.env.OPENAI_KEY,
    vectorSearchRatio: 0.5,
    maxResults: 5,
  },
});
app.mount({ movies: movies.exports as any });
export default app;
