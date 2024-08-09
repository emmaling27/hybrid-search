import {
  action,
  component,
  componentArg,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { functions } from "./_generated/api";
import { v } from "convex/values";
import { EXAMPLE_DATA, CUISINES } from "../constants";

export async function embed(ctx: any, text: string): Promise<number[]> {
  const key = componentArg(ctx, "openAiKey");
  if (!key) {
    throw new Error("OPENAI_KEY environment variable not set!");
  }
  const req = { input: text, model: "text-embedding-ada-002" };
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(req),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`OpenAI API error: ${msg}`);
  }
  const json = await resp.json();
  const vector = json["data"][0]["embedding"];
  console.log(`Computed embedding of "${text}": ${vector.length} dimensions`);
  return vector;
}

export const fetchResults = query({
  args: {
    results: v.array(v.object({ _id: v.id("table"), _score: v.float64() })),
  },
  handler: async (ctx, args) => {
    const out: HybridSearchResult[] = [];
    for (const result of args.results) {
      const doc = await ctx.db.get(result._id);
      if (!doc) {
        continue;
      }
      out.push({
        _id: doc._id,
        textField: doc.textField,
        filterField: doc.filterField,
        _score: result._score,
      });
    }
    return out;
  },
});

export type HybridSearchResult = {
  _id: string;
  textField: string;
  filterField: string;
  _score?: number;
};

export const vectorSearch = action({
  args: {
    query: v.string(),
    filterField: v.optional(v.array(v.string())),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, { query, filterField, limit }) => {
    let maxResults = limit ?? componentArg(ctx, "maxResults");
    maxResults = Math.round(maxResults);
    const embedding = await embed(ctx, query);
    let results;
    if (filterField !== undefined) {
      results = await ctx.vectorSearch("table", "vector_search", {
        vector: embedding,
        limit: maxResults,
        filter: (q) =>
          q.or(...filterField.map((cuisine) => q.eq("filterField", cuisine))),
      });
    } else {
      results = await ctx.vectorSearch("table", "vector_search", {
        vector: embedding,
        limit: maxResults,
      });
    }
    const rows: HybridSearchResult[] = await ctx.runQuery(
      functions.vector_search.fetchResults,
      {
        results,
      }
    );
    return rows;
  },
});

export const populate = action({
  args: {},
  handler: async (ctx) => {
    for (const doc of EXAMPLE_DATA) {
      const embedding = await embed(ctx, doc.description);
      await ctx.runMutation(functions.vector_search.insertRow, {
        filterField: doc.cuisine,
        textField: doc.description,
        embedding,
      });
    }
  },
});

export const populateFrom = action({
  args: {
    data: v.array(
      v.object({
        textField: v.string(),
        filterField: v.string(),
        parentId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const doc of args.data) {
      const embedding = await embed(ctx, doc.textField);
      await ctx.runMutation(functions.vector_search.insertRow, {
        filterField: doc.filterField,
        textField: doc.textField,
        embedding,
        parentId: doc.parentId,
      });
    }
  },
});

export const insertRow = mutation({
  args: {
    textField: v.string(),
    filterField: v.string(),
    embedding: v.array(v.float64()),
    parentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // if (!Object.prototype.hasOwnProperty.call(CUISINES, args.filterField)) {
    //   throw new Error(`Invalid cuisine: ${args.filterField}`);
    // }
    await ctx.db.insert("table", args);
  },
});

export const list = query(async (ctx) => {
  const docs = await ctx.db.query("table").order("desc").take(10);
  return docs.map((doc) => {
    return {
      _id: doc._id,
      description: doc.textField,
      cuisine: doc.filterField,
    };
  });
});

export const insert = action({
  args: { filterField: v.string(), textField: v.string() },
  handler: async (ctx, { textField, filterField }) => {
    const embedding = await embed(ctx, textField);
    const doc = {
      filterField: filterField,
      textField: textField,
      embedding,
    };
    await ctx.runMutation(functions.vector_search.insertRow, doc);
  },
});
