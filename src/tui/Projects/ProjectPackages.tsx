import { useState } from "react";
import { CsprojProject } from "../../projects/project-finder.js";
import { Box, Text, useInput } from "ink";
import { PADDING } from "../types/types.js";
import { dirname } from "node:path";
import { CommandState } from "./CommandState.js";
import { Footer } from "./Footer.js";
import { addPackageCommand, removePackageCommand } from "./utils.js";
import { usePackageActions } from "./hooks/usePackageActions.js";
import { useAllPackageLatest } from "./hooks/useAllPackageLatest.js";
import { ProjectPackagesList } from "./ProjectPackagesList.js";

interface Props {
  project: CsprojProject;
  onReload: () => Promise<void>;
  onOpenInstallSearch: (cb: (id: string, version: string) => void) => void;
}

export const ProjectPackages = ({ project, onReload, onOpenInstallSearch }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const pkg = project.packages[selectedIndex];
  const projectDir = dirname(project.filePath);

  const { latestMap, fetching } = useAllPackageLatest(project.packages);
  const latestData = latestMap.get(pkg?.id ?? "") ?? null;

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

    if (input === "a") {
      onOpenInstallSearch((id, version) => {
        executeCommand(
          addPackageCommand({ id, version }),
          `Added ${id} ${version}`,
        );
      });
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
          <ProjectPackagesList
            project={project}
            latestMap={latestMap}
            selectedIndex={selectedIndex}
          />
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
