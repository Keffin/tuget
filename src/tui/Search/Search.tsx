import { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { searchPackages } from "../../nuget-client/nuget-client.js";
import { SearchSpinner } from "./SearchSpinner.js";
import { SearchResult } from "./SearchResult.js";
import { Footer } from "./Footer.js";
import clipboard from "clipboardy";
import { SearchPackagesResult } from "../types/types.js";

export const Search = () => {
  const [query, setQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchPackagesResult>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);


  useInput((_, key) => {
    if (key.return && searchResult[selectedIndex]) {
      const pkg = searchResult[selectedIndex];
      clipboard.writeSync(
        `<PackageReference Include="${pkg.id}" Version="${pkg.version}" />`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

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

    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchPackages(query, abortController.signal);
        setSearchResult(data);
        setSelectedIndex(0);
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
        <SearchResult results={searchResult} selectedIndex={selectedIndex} />
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

      {copied && <Text color="green">✓ Copied to clipboard</Text>}

      <SearchContent />

      <Footer />
    </Box>
  );
};
