import { useState } from "react";
import { Box, Text, useInput } from "ink";
import { basename } from "node:path";
import { CsprojProject, SlnxSolution } from "../../projects/project-finder.js";

interface Props {
  solution: SlnxSolution;
  onSelectProject: (project: CsprojProject) => void;
}

export const SolutionProjects = ({ solution, onSelectProject }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => (i === 0 ? solution.projects.length - 1 : i - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((i) =>
        i === solution.projects.length - 1 ? 0 : i + 1,
      );
    }
    if (key.return) {
      const proj = solution.projects[selectedIndex];
      if (proj) onSelectProject(proj);
    }
  });

  return (
    <Box flexDirection="column">
      <Text dimColor>{solution.filePath}</Text>
      <Box borderStyle="single" flexDirection="column" paddingX={1}>
        {solution.projects.map((p, i) => (
          <Text key={p.filePath} color={i === selectedIndex ? "cyan" : undefined}>
            {i === selectedIndex ? "> " : "  "}
            {basename(p.filePath, ".csproj")}
            <Text dimColor> ({p.packages.length} packages)</Text>
          </Text>
        ))}
      </Box>
      <Box marginTop={1} gap={3}>
        <Text dimColor>↑↓ navigate</Text>
        <Text dimColor>Enter to open</Text>
        <Text dimColor>ESC to go back</Text>
      </Box>
    </Box>
  );
};
