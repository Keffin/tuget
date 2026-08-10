import { Box, Text } from "ink";
import { searchPackages } from "../nuget-client/nuget-client.js";

interface Props {
  results: Awaited<ReturnType<typeof searchPackages>>;
  selectedIndex: number;
}

export const SearchResult = ({ results, selectedIndex }: Props) => {
  const pkg = results[selectedIndex];

  const listWidth = Math.max(...results.map(x => x.id?.length ?? 0)) + 4; // +4 for "> " and padding
  const rightWidth = (process.stdout.columns ?? 80) - listWidth - 4; // 4 for two borders

  return (
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
        {pkg && (
          <>
            <Text bold>{pkg.id}</Text>
            <Text dimColor>{pkg.version}</Text>
            <Text>{"\n"}</Text>
            <Text>{pkg.description}</Text>
            <Text>{"\n"}</Text>
            <Text>Downloads: {pkg.totalDownloads.toLocaleString()}</Text>
            <Text>
              License: {pkg.licenseExpression ?? pkg.licenseUrl ?? "—"}
            </Text>
            <Text>Project: {pkg.projectUrl ?? "—"}</Text>
            <Text>Tags: {pkg.tags?.join(", ") ?? "—"}</Text>
          </>
        )}
      </Box>
    </Box>
  );
};
