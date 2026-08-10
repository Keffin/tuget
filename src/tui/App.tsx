import React, { useState, useEffect } from "react";
import { Box, render, Text, useInput } from "ink";
import { searchPackages } from "../nuget-client/nuget-client.js";
import TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { SearchSpinner } from "./SearchSpinner.js";

const SearchComponent = () => {
  const [query, setQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<
    Awaited<ReturnType<typeof searchPackages>>
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (searchQuery: string) => {
    setLoading(true);
    const data = await searchPackages(searchQuery);
    setSearchResult(data);
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
      ) : (
        searchResult.map((pkg) => (
          <Text key={pkg.id}>
            {pkg.id} - {pkg.version}{" "}
          </Text>
        ))
      )}
    </Box>
  );
};

export const startApp = async (): Promise<void> => {
  render(<SearchComponent />);
};
