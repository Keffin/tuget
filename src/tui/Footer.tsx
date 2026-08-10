import { Box, Text } from "ink";

export const Footer = () => {
  return (
    <Box marginTop={1} gap={3}>
      <Text dimColor>↑↓ navigate</Text>
      <Text dimColor>type to search</Text>
      <Text dimColor>ESC quit</Text>
    </Box>
  );
};
