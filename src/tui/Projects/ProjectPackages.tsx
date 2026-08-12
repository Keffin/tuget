import { useEffect, useState } from "react";
import { CsprojProject } from "../../projects/project-finder.js";
import { Box, Text, useInput } from "ink";
import { PADDING } from "../types/types.js";
import { NuGetSearchData } from "../../nuget-client/schemas.js";
import { getPackageLatestState } from "../../nuget-client/nuget-client.js";

interface Props {
  project: CsprojProject;
}
export const ProjectPackages = ({ project }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const pkg = project.packages[selectedIndex];

  const [latestData, setLatestData] = useState<NuGetSearchData | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);

  useEffect(() => {
    if (!pkg) {
      return;
    }

    const controller = new AbortController();
    setFetching(true);

    getPackageLatestState(pkg.id, controller.signal)
      .then(setLatestData)
      .finally(() => setFetching(false));
    return () => controller.abort();
  }, [selectedIndex]);

  useInput((_, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => (i === 0 ? project.packages.length - 1 : i - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((i) => (i === project.packages.length - 1 ? 0 : i + 1));
    }
  });

  // Need a bit wider defaults for this view
  const listWidth = Math.max(
    30,
    Math.max(...project.packages.map((p) => p.id.length)) + 6,
  );
  const rightWidth = (process.stdout.columns ?? 80) - listWidth - PADDING;

  return (
    <Box flexDirection="column">
      <Text dimColor>{project.filePath}</Text>
      <Box flexDirection="row">
        <Box flexDirection="column" width={listWidth} borderStyle="single">
          {project.packages.map((p, i) => (
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
              <Text>
                Installed: <Text color="cyan">{pkg.version}</Text>
              </Text>
              {fetching && <Text dimColor>Fetching latest...</Text>}
              {!fetching && latestData && (
                <Text>
                  Latest:{" "}
                  <Text
                    color={
                      latestData.version !== pkg.version ? "yellow" : "green"
                    }
                  >
                    {latestData.version}
                  </Text>
                </Text>
              )}
            </>
          )}
        </Box>
      </Box>
      <Box marginTop={1} gap={3}>
        <Text dimColor>↑↓ navigate</Text>
        <Text dimColor>ESC to go back</Text>
      </Box>
    </Box>
  );
};
