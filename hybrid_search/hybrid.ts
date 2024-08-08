import { v } from "convex/values";
import { action, componentArg } from "./_generated/server";
import { functions } from "./_generated/api";

type SearchResult = {
  _id: string;
  textField: string;
  filterField: string;
  _score: number;
};

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
    let results = new Map<string, SearchResult>();
    for (let result of vectorResults) {
      const searchResult = {
        _id: result._id,
        textField: result.textField,
        filterField: result.filterField,
        _score: result._score ?? 1,
      };
      results.set(result._id, searchResult);
    }
    for (let result of textResults) {
      let searchResult;
      if (results.get(result._id)) {
        searchResult = {
          _id: result._id,
          textField: result.textField,
          filterField: result.filterField,
          _score: 2,
        };
      } else {
        searchResult = {
          _id: result._id,
          textField: result.textField,
          filterField: result.filterField,
          _score: 1,
        };
      }
      results.set(result._id, searchResult);
    }
    console.log(results);
    let sortedResults = new Map(
      [...results.entries()].sort((a, b) => b[1]._score - a[1]._score)
    );
    return [...sortedResults.values()];
  },
});
