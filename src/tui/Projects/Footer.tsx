import { Box, Text } from "ink";

interface Props {
  isOutdated: boolean;
}

export const Footer = ({ isOutdated }: Props) => {
  return (
    <Box marginTop={1} gap={3}>
      <Text dimColor>↑↓ navigate</Text>
      {isOutdated && <Text dimColor>u to update</Text>}
      <Text dimColor>r to remove</Text>
      <Text dimColor>ESC to go back</Text>
    </Box>
  );
};
