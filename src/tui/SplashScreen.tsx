import { Box, Text } from "ink";
import { basename } from "node:path";
import { AppData } from "../projects/project-finder.js";

interface Props {
  appData: AppData;
}

export const SplashScreen = ({ appData }: Props) => {
  const projectMenuLabel =
    appData?.kind === "solution"
      ? `${basename(appData.solution.filePath)} — ${appData.solution.projects.length} projects`
      : appData?.kind === "project"
        ? `${basename(appData.project.filePath)} — ${appData.project.packages.length} packages`
        : null;

  return (
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
            {" "}1{" "}
          </Text>
          {"  Search packages"}
        </Text>
        {projectMenuLabel && (
          <Text>
            <Text color="cyan" bold>
              {" "}2{" "}
            </Text>
            {`  ${projectMenuLabel}`}
          </Text>
        )}
        <Text>
          <Text color="cyan" bold>
            {" "}q{" "}
          </Text>
          {"  Quit"}
        </Text>
      </Box>
    </Box>
  );
};
