import { useState } from "react";
import { CommandStatus } from "../../types/types.js";
import { runDotnet } from "../dotnet-runner.js";
import { addPackageCommand } from "../utils.js";

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

  const executeBulkUpdate = async (
    updates: Array<{ id: string; version: string }>,
  ) => {
    for (let i = 0; i < updates.length; i++) {
      const pkg = updates[i]!;
      setStatus({
        type: "running",
        command: `add package ${pkg.id} --version ${pkg.version} (${i + 1}/${updates.length})`,
      });
      await runDotnet(
        addPackageCommand({ id: pkg.id, version: pkg.version }),
        projectDir,
      );
    }

    await onReload();
    setStatus({
      type: "done",
      message: `Updated ${updates.length} package${updates.length === 1 ? "" : "s"}`,
    });
  };

  return { status, executeCommand, executeBulkUpdate };
};
