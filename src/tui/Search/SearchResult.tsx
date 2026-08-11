import { Box, Text } from "ink";
import {
  MAX_VERSIONS,
  Mode,
  Package,
  PADDING,
  SearchPackagesResult,
} from "../types/types.js";

interface Props {
  results: SearchPackagesResult;
  selectedIndex: number;
  selectedVersionIndex: number;
  mode: Mode;
}

export const SearchResult = ({
  results,
  selectedIndex,
  selectedVersionIndex,
  mode,
}: Props) => {
  const pkg = results[selectedIndex];

  const listWidth =
    Math.max(...results.map((x) => x.id?.length ?? 0)) + PADDING;
  const rightWidth = (process.stdout.columns ?? 80) - listWidth - PADDING;

  return (
    <Box flexDirection="column">
      <Text dimColor>{results.length} results</Text>
      <Box flexDirection="row">
        <Box flexDirection="column" width={listWidth} borderStyle="single">
          {results.map((p, i) => (
            <Text key={p.id} color={i === selectedIndex ? "cyan" : undefined}>
              {i === selectedIndex ? "> " : "  "}
              {p.id}
            </Text>
          ))}
        </Box>

        <Box
          flexDirection="column"
          width={rightWidth}
          borderStyle="single"
          paddingX={1}
        >
          {pkg && mode === "packages" && <PackagesView pkg={pkg} />}

          {pkg && mode === "versions" && (
            <VersionsView
              pkg={pkg}
              selectedVersionIndex={selectedVersionIndex}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

const PackagesView = ({ pkg }: { pkg: Package }) => {
  return (
    <>
      <Text bold>{pkg.id}</Text>
      <Text dimColor>{pkg.version}</Text>
      {pkg.deprecation && (
        <Text color="yellow">
          Deprecated:{" "}
          {pkg.deprecation.message ?? pkg.deprecation.reasons?.join(", ")}
        </Text>
      )}
      {(pkg.vulnerabilities?.length ?? 0) > 0 && (
        <Text color="red">
          ⚠ {pkg.vulnerabilities!.length} vulnerabilit
          {pkg.vulnerabilities!.length === 1 ? "y" : "ies"}
        </Text>
      )}
      <Text>{"\n"}</Text>
      <Text>{pkg.description}</Text>
      <Text>{"\n"}</Text>
      <Text>Downloads: {pkg.totalDownloads.toLocaleString()}</Text>
      <Text>License: {pkg.licenseExpression ?? pkg.licenseUrl ?? "—"}</Text>
      <Text>Project: {pkg.projectUrl ?? "—"}</Text>
      <Text>Tags: {pkg.tags?.join(", ") ?? "—"}</Text>
    </>
  );
};

const VersionsView = ({
  pkg,
  selectedVersionIndex,
}: {
  pkg: Package;
  selectedVersionIndex: number;
}) => {
  const versions = [...(pkg.versions ?? [])].reverse().slice(0, MAX_VERSIONS);
  return (
    <>
      <Text bold>{pkg.id}</Text>
      <Text dimColor>Select a version</Text>
      <Text>{"\n"}</Text>
      {versions.map((v, i) => (
        <Text
          key={v.version}
          color={i === selectedVersionIndex ? "cyan" : undefined}
        >
          {i === selectedVersionIndex ? "> " : "  "}
          {v.version ?? "—"}
        </Text>
      ))}
    </>
  );
};
