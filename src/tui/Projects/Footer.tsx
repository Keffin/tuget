import { Box, Text } from "ink";

interface Props {
  isOutdated: boolean;
  outdatedCount: number;
}

export const Footer = ({ isOutdated, outdatedCount }: Props) => {
  return (
    <Box marginTop={1} gap={3}>
      <Text dimColor>↑↓ navigate</Text>
      <Text dimColor>a to add</Text>
      {isOutdated && <Text dimColor>u to update</Text>}
      {outdatedCount > 1 && <Text dimColor>U to update all</Text>}
      <Text dimColor>r to remove</Text>
      <Text dimColor>ESC to go back</Text>
    </Box>
  );
};
