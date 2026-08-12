import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const DRY_RUN = process.env.DRY_RUN === "true";

export async function runDotnet(args: string, cwd: string): Promise<void> {
  if (DRY_RUN) {
    console.error(`[dry-run] dotnet ${args}`);
    return;
  }

  await execAsync(`dotnet ${args}`, { cwd });
}
