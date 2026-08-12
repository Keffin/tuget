import { Text } from "ink";
import { CommandStatus } from "../types/types.js"

interface Props {
  status: CommandStatus;
}
export const CommandState = ({ status }: Props) => {
  return (
    <>
      {status.type === "running" && (
        <Text color="cyan">⟳ Running: dotnet {status.command}</Text>
      )}
      {status.type === "done" && <Text color="green">✓ {status.message}</Text>}
      {status.type === "error" && <Text color="red">✗ {status.message}</Text>}
    </>
  );
};
