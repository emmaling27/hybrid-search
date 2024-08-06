import { defineApp } from "convex/server";
import hybrid_search from "../hybrid_search/component.config";

const app = defineApp();
app.install(hybrid_search, {});
export default app;
