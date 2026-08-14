import { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { searchPackages } from "../../nuget-client/nuget-client.js";
import { SearchSpinner } from "./SearchSpinner.js";
import { SearchResult } from "./SearchResult.js";
import { Footer } from "./Footer.js";
import clipboard from "clipboardy";
import { SearchPackagesResult } from "../types/types.js";
import { FORMATS } from "./utils.js";
import { useSearchNavigation } from "./hooks/useSearchNavigation.js";

interface Props {
  onInstall?: (id: string, version: string) => void;
}

export const Search = ({ onInstall }: Props) => {
  const [query, setQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchPackagesResult>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { selectedIndex, selectedVersionIndex, mode, copied, currentFormat } =
    useSearchNavigation(searchResult, onInstall);

  useEffect(() => {
    if (!query) {
      setSearchResult([]);
      return;
    }

    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchPackages(query, abortController.signal);
        setSearchResult(data);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          throw e;
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  const SearchContent = () => {
    if (loading) {
      return <SearchSpinner />;
    }

    if (searchResult.length > 0) {
      return (
        <SearchResult
          results={searchResult}
          selectedIndex={selectedIndex}
          selectedVersionIndex={selectedVersionIndex}
          mode={mode}
        />
      );
    }

    if (query) {
      return <Text dimColor>No results for "{query}"</Text>;
    }

    return null;
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="cyan" paddingX={1} width={50}>
        <TextInput
          placeholder="Search NuGet packages..."
          value={query}
          onChange={setQuery}
        />
      </Box>

      {!onInstall && copied && (
        <Text color="green">
          ✓ Copied to clipboard as {currentFormat.label}
        </Text>
      )}
      {!onInstall && (
        <Text dimColor>
          Format: <Text color="cyan">{currentFormat.label}</Text>
        </Text>
      )}
      <SearchContent />

      <Footer mode={mode} installMode={!!onInstall} />
    </Box>
  );
};
