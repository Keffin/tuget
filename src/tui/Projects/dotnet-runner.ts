import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function runDotnet(args: string, cwd: string, dryRun = false): Promise<void> {
  if (dryRun) {
    console.error(`[dry-run] dotnet ${args}`);
    return;
  }

  await execAsync(`dotnet ${args}`, { cwd });
}
