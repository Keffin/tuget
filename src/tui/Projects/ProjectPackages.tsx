import { useState } from "react";
import { CsprojProject } from "../../projects/project-finder.js";
import { Box, Text, useInput } from "ink";
import { PADDING } from "../types/types.js";

interface Props {
  project: CsprojProject;
}
export const ProjectPackages = ({ project }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const pkg = project.packages[selectedIndex];

  useInput((_, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => (i === 0 ? project.packages.length - 1 : i - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((i) => (i === project.packages.length - 1 ? 0 : i + 1));
    }
  })

  const listWidth = Math.max(...project.packages.map((p) => p.id.length)) + PADDING;
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
        <Box flexDirection="column" width={rightWidth} borderStyle="single" paddingX={1}>
          {pkg && (
            <>
              <Text bold>{pkg.id}</Text>
              <Text dimColor>{pkg.version}</Text>
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
