import { useEffect, useState } from "react";
import { Box, render, Text, useInput } from "ink";
import { searchPackages } from "../nuget-client/nuget-client.js";
import TextInput from "ink-text-input";
import { SearchSpinner } from "./SearchSpinner.js";
import { SearchResult } from "./SearchResult.js";

const SearchComponent = () => {
  const [query, setQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<
    Awaited<ReturnType<typeof searchPackages>>
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useInput((_, key) => {
    if (key.upArrow) {
      if (selectedIndex === 0) {
        setSelectedIndex(searchResult.length - 1);
      } else {
        setSelectedIndex((i) => Math.max(0, i - 1));
      }
    }

    if (key.downArrow) {
      if (selectedIndex === searchResult.length - 1) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex((i) => Math.min(searchResult.length - 1, i + 1));
      }
    }
  });

  useEffect(() => {
    if (!query) {
      setSearchResult([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await searchPackages(query);
      setSearchResult(data);
      setSelectedIndex(0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const onSubmit = async (searchQuery: string) => {
    setLoading(true);
    const data = await searchPackages(searchQuery);
    setSearchResult(data);
    setSelectedIndex(0);
    setLoading(false);
  };

  return (
    <Box flexDirection="column">
      <Box marginRight={1}>
        <Text>Enter package name:</Text>
      </Box>

      <TextInput value={query} onChange={setQuery} onSubmit={onSubmit} />
      {loading ? (
        <SearchSpinner />
      ) : searchResult.length > 0 ? (
        <SearchResult results={searchResult} selectedIndex={selectedIndex} />
      ) : null}
    </Box>
  );
};

export const startApp = async (): Promise<void> => {
  render(<SearchComponent />);
};
