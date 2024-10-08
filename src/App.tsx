import { FormEvent, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { HybridSearchResult } from "../hybrid_search/vector_search";
import { CUISINES, GENRES } from "../constants";

function Insert() {
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("american");
  const [insertInProgress, setInsertInProgress] = useState(false);
  const insert = useAction(api.index.insert);

  async function handleInsert(event: FormEvent) {
    event.preventDefault();
    setInsertInProgress(true);
    try {
      await insert({ description, cuisine });
      setDescription("");
    } finally {
      setInsertInProgress(false);
    }
  }
  return (
    <>
      <h2>Add a new food</h2>
      <form onSubmit={handleInsert}>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
        />
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          {Object.entries(CUISINES).map(([c, e]) => (
            <option key={c} value={c}>
              {presentCuisine(c, e)}
            </option>
          ))}
        </select>
        <input
          type="submit"
          value="Insert"
          disabled={!description || insertInProgress}
        />
      </form>
    </>
  );
}

function presentCuisine(name: string, emoji: string) {
  return `${emoji} ${name[0].toUpperCase()}${name.slice(1)}`;
}

function Search({ searchApi, filterVariants }) {
  const [searchText, setSearchText] = useState("");
  const [submittedSearchText, setSubmittedSearchText] = useState("");
  const [searchFilter, setSearchFilter] = useState<string[]>([]);
  const [submittedSearchFilter, setSubmittedSearchFilter] = useState<string[]>(
    []
  );
  const [searchResults, setSearchResults] = useState<
    HybridSearchResult[] | undefined
  >();
  const [hybridSearchResults, setHybridSearchResults] = useState<
    HybridSearchResult[] | undefined
  >();
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [hybridSearchInProgress, setHybridSearchInProgress] = useState(false);
  const [semanticRatio, setSemanticRatio] = useState(0.5);
  const vectorSearch = useAction(searchApi.vector_search.vectorSearch);
  const fullTextSearch = useQuery(searchApi.text_search.fullTextSearch, {
    query: submittedSearchText,
    filterField:
      submittedSearchFilter.length !== 0 ? submittedSearchFilter[0] : undefined,
  });
  const hybridSearch = useAction(searchApi.hybrid.hybridSearch);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    setSearchResults(undefined);
    setSubmittedSearchText(searchText);
    setSubmittedSearchFilter(searchFilter);
    if (!searchText) {
      return;
    }
    setSearchInProgress(true);
    setHybridSearchInProgress(true);
    try {
      const vectorQuery = vectorSearch({
        query: searchText,
        filterField: searchFilter.length > 0 ? searchFilter : undefined,
      });
      const hybridQuery = hybridSearch({
        query: searchText,
        filterField: searchFilter.length > 0 ? searchFilter[0] : undefined, // TODO error if there is more than one filter
      });
      const [vectorResults, hybridResults] = await Promise.all([
        vectorQuery,
        hybridQuery,
      ]);
      setSearchResults(vectorResults);
      setHybridSearchResults(hybridResults);
    } finally {
      setSearchInProgress(false);
      setHybridSearchInProgress(false);
    }
  };
  return (
    <>
      <h2>Search foods (Cmd-click to add filters)</h2>
      <form onSubmit={handleSearch}>
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Query"
        />
        <select
          value={searchFilter}
          multiple={true}
          onChange={(e) =>
            setSearchFilter([...e.target.selectedOptions].map((o) => o.value))
          }
        >
          {Object.entries(filterVariants).map(([c, e]) => (
            <option key={c} value={c}>
              {presentCuisine(c, e)}
            </option>
          ))}
        </select>
        <input
          value={semanticRatio}
          type="number"
          min="0"
          max="1"
          step=".1"
          onChange={(e) => setSemanticRatio(parseFloat(e.target.value))}
          placeholder="Semantic ratio"
        />
        <input type="submit" value="Search" disabled={searchInProgress} />
      </form>
      <div className="row">
        <div className="column">
          <h3>Vector Results</h3>
          {searchResults !== undefined && (
            <ul>
              {searchResults.map((result) => (
                <li key={result._id}>
                  <span>
                    {(filterVariants as any)[result.filterField.toLowerCase()]}
                  </span>
                  <span>{result.textField}</span>
                  <span>{result._score?.toFixed(4)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="column">
          <h3>Full Text Search Results</h3>
          {fullTextSearch !== undefined && (
            <ul>
              {fullTextSearch.map((result) => (
                <li key={result._id}>
                  <span>
                    {(filterVariants as any)[result.filterField.toLowerCase()]}
                  </span>
                  <span>{result.textField}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="column">
          <h3>Hybrid Search Results</h3>
          {hybridSearchResults !== undefined && (
            <ul>
              {hybridSearchResults.map((result) => (
                <li key={result._id}>
                  <span>
                    {(filterVariants as any)[result.filterField.toLowerCase()]}
                  </span>
                  <span>{result.textField}</span>
                  <span>{result._score?.toFixed(4)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default function App() {
  const entries = useQuery(api.index.list);
  const [submitted, setSubmitted] = useState(false);
  const populate = useAction(api.index.populate);
  return (
    <main>
      <h1>🍔 Food vector search</h1>
      <h2>Entries (ten most recent)</h2>
      {entries === undefined && (
        <center>
          <i>Loading...</i>
        </center>
      )}
      {entries !== undefined && entries.length === 0 && (
        <center>
          <i>No entries yet</i>
          <input
            type="button"
            value="Populate test data"
            onClick={() => {
              setSubmitted(true);
              populate();
            }}
            disabled={submitted}
          />
        </center>
      )}
      {entries && entries.length > 0 && (
        <ul>
          {entries.map((entry) => (
            <li key={entry._id}>
              <span>{(CUISINES as any)[entry.cuisine]}</span>
              <span>{entry.description}</span>
            </li>
          ))}
        </ul>
      )}
      <Insert />
      <Search searchApi={api.foods} filterVariants={CUISINES} />
      <Search searchApi={api.movies} filterVariants={GENRES} />
    </main>
  );
}
