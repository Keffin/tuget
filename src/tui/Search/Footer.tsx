import { Box, Text } from "ink";
import { Mode } from "../types/types.js";

interface Props {
  mode: Mode;
  installMode?: boolean;
}

export const Footer = ({ mode, installMode }: Props) => {
  const action = installMode ? "install" : "copy";

  if (mode === "versions") {
    return (
      <Box marginTop={1} gap={3}>
        <Text dimColor>↑↓ navigate versions</Text>
        <Text dimColor>← back</Text>
        <Text dimColor>RETURN to {action}</Text>
      </Box>
    );
  }

  return (
    <Box marginTop={1} gap={3}>
      <Text dimColor>↑↓ navigate</Text>
      <Text dimColor>→ pick version</Text>
      {!installMode && <Text dimColor>tab to cycle format</Text>}
      <Text dimColor>ESC to go back</Text>
      <Text dimColor>RETURN to {action}</Text>
    </Box>
  );
};
