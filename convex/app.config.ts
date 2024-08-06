import { defineApp } from "convex/server";
import hybrid_search from "../hybrid_search/component.config";

const app = defineApp();
const c = app.install(hybrid_search, {
  args: { openAiKey: process.env.OPENAI_KEY, vectorSearchRatio: 0.5 },
});
const e = c.exports;
// app.mount({ mountedExports: c.exports });
export default app;
