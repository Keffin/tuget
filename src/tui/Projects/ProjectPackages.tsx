import { useEffect, useState } from "react";
import { CsprojProject } from "../../projects/project-finder.js";
import { Box, Text, useInput } from "ink";
import { CommandStatus, PADDING } from "../types/types.js";
import { NuGetSearchData } from "../../nuget-client/schemas.js";
import { getPackageLatestState } from "../../nuget-client/nuget-client.js";
import { runDotnet } from "./dotnet-runner.js";
import { dirname } from "node:path";
import { CommandState } from "./CommandState.js";
import { Footer } from "./Footer.js";
import { addPackageCommand, removePackageCommand } from "./utils.js";
import { usePackageActions } from "./hooks/usePackageActions.js";
import { usePackageLatest } from "./hooks/usePackageLatest.js";
import { useAllPackageLatest } from "./hooks/useAllPackageLatest.js";

interface Props {
  project: CsprojProject;
  onReload: () => Promise<void>;
}

export const ProjectPackages = ({ project, onReload }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const pkg = project.packages[selectedIndex];
  const projectDir = dirname(project.filePath);

  const { latestData, fetching } = usePackageLatest(pkg?.id);
  const { latestMap, allFetching } = useAllPackageLatest(project.packages);
  const { status, executeCommand, executeBulkUpdate } = usePackageActions(
    projectDir,
    onReload,
  );

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => (i === 0 ? project.packages.length - 1 : i - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((i) => (i === project.packages.length - 1 ? 0 : i + 1));
    }

    if (
      input === "u" &&
      pkg &&
      latestData &&
      pkg.version !== latestData.version
    ) {
      executeCommand(
        addPackageCommand({ id: pkg.id, version: latestData.version }),
        `Updated ${pkg.id} to ${latestData.version}`,
      );
    }

    if (input === "U") {
      const updates = project.packages.flatMap((p) => {
        const latest = latestMap.get(p.id);
        return latest && latest.version && latest.version !== p.version
          ? [{ id: p.id, version: latest.version }]
          : [];
      });

      if (updates.length > 0) {
        executeBulkUpdate(updates);
      }
    }

    if (input === "r" && pkg) {
      executeCommand(removePackageCommand({ id: pkg.id }), `Removed ${pkg.id}`);
    }
  });

  // Need a bit wider defaults for this view
  const listWidth = Math.max(
    30,
    Math.max(...project.packages.map((p) => p.id.length)) + 6,
  );
  const rightWidth = (process.stdout.columns ?? 80) - listWidth - PADDING;
  const outdatedCount = project.packages.filter((p) => {
    const latest = latestMap.get(p.id);
    return latest?.version && latest.version !== p.version;
  }).length;

  return (
    <Box flexDirection="column">
      <Text dimColor>{project.filePath}</Text>
      <Box flexDirection="row">
        <Box flexDirection="column" width={listWidth} borderStyle="single">
          {project.packages.map((p, i) => {
            const latest = latestMap.get(p.id);
            const isOutdated = latest?.version && latest.version !== p.version;
            const isVulnerable = (latest?.vulnerabilities?.length ?? 0) > 0;
            const isDeprecated = !!latest?.deprecation;

            return (
              <Text key={p.id} color={i === selectedIndex ? "cyan" : undefined}>
                {i === selectedIndex ? "> " : "  "}
                {p.id}
                {isVulnerable && <Text color="red"> ⚠</Text>}
                {isDeprecated && !isVulnerable && (
                  <Text color="yellow"> ⚑</Text>
                )}
                {isOutdated && !isVulnerable && !isDeprecated && (
                  <Text color="yellow"> ↑</Text>
                )}
              </Text>
            );
          })}
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
                Installed: <Text color="cyan">{pkg.version ?? "—"}</Text>
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
              {latestData?.deprecation && (
                <Text color="yellow">
                  ⚑ Deprecated:{" "}
                  {latestData.deprecation.message ??
                    latestData.deprecation.reasons?.join(", ")}
                </Text>
              )}
              {(latestData?.vulnerabilities?.length ?? 0) > 0 && (
                <Text color="red">
                  ⚠ {latestData!.vulnerabilities!.length} vulnerabilit
                  {latestData!.vulnerabilities!.length === 1 ? "y" : "ies"}
                </Text>
              )}
            </>
          )}
        </Box>
      </Box>
      <CommandState status={status} />
      <Footer
        isOutdated={
          !fetching &&
          !!latestData?.version &&
          latestData.version !== pkg?.version
        }
        outdatedCount={outdatedCount}
      />
    </Box>
  );
};
