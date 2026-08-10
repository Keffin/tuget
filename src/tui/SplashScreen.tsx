import { Box, Text } from "ink";

export const SplashScreen = () => (
  <Box
    flexDirection="column"
    height={process.stdout.rows}
    alignItems="center"
    justifyContent="center"
  >
    <Text bold color="cyan">{`
   _                   _
  | |_ _   _  __ _  ___| |_
  | __| | | |/ _\` |/ _ \\ __|
  | |_| |_| | (_| |  __/ |_
   \\__|\\__,_|\\__, |\\___|\\__|
             |___/
      `}</Text>
    <Text dimColor>NuGet package browser</Text>
    <Box flexDirection="column" alignItems="flex-start" marginTop={2} gap={1}>
      <Text>
        <Text color="cyan" bold>
          {" "}
          1{" "}
        </Text>
        {"  Search packages"}
      </Text>
      <Text>
        <Text color="cyan" bold>
          {" "}
          q{" "}
        </Text>
        {"  Quit"}
      </Text>
    </Box>
  </Box>
);
