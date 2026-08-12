import { useState } from "react";
import { CommandStatus } from "../../types/types.js";
import { runDotnet } from "../dotnet-runner.js";

export const usePackageActions = (
  projectDir: string,
  onReload: () => Promise<void>,
) => {
  const [status, setStatus] = useState<CommandStatus>({ type: "idle" });

  const executeCommand = (command: string, successMessage: string) => {
    setStatus({ type: "running", command });
    runDotnet(command, projectDir)
      .then(async () => {
        await onReload();
        setStatus({ type: "done", message: successMessage });
      })
      .catch((e) => setStatus({ type: "error", message: e.message }));
  };

  return { status, executeCommand };
};
