import { v } from "convex/values";
import { action, componentArg } from "./_generated/server";
import { functions } from "./_generated/api";
import { HybridSearchResult } from "./vector_search";

export const hybridSearch = action({
  args: {
    query: v.string(),
    filterField: v.optional(v.string()),
    semanticRatio: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    let vectorRatio =
      args.semanticRatio ?? componentArg(ctx, "vectorSearchRatio");
    let maxResults = componentArg(ctx, "maxResults");
    let vectorSearch = ctx.runAction(functions.vector_search.vectorSearch, {
      query: args.query,
      filterField: args.filterField ? [args.filterField] : [],
      limit: maxResults * vectorRatio,
    });
    let textSearch = ctx.runQuery(functions.text_search.fullTextSearch, {
      query: args.query,
      filterField: args.filterField,
      limit: maxResults * (1 - vectorRatio),
    });
    let [vectorResults, textResults] = await Promise.all([
      vectorSearch,
      textSearch,
    ]);
    let results = new Map<HybridSearchResult, number>();
    for (let result of vectorResults) {
      result = {
        _id: result._id,
        textField: result.textField,
        filterField: result.filterField,
      };
      results.set(result, 1);
    }
    for (let result of textResults) {
      let searchResult = {
        _id: result._id,
        textField: result.textField,
        filterField: result.filterField,
      };
      if (results.get(searchResult)) {
        results.set(result, 2);
      } else {
        results.set(result, 1);
      }
    }
    console.log(results);
    // make an array of the results sorted by the rank (the value in the map)
    let sortedResults = new Map(
      [...results.entries()].sort((a, b) => b[1] - a[1]),
    );
    const finalResults2 = [...sortedResults.keys()];

    return finalResults2;
  },
});
