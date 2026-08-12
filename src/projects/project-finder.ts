import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { join } from "node:path";

export type CsprojPackage = {
  id: string;
  version: string;
};

export type CsprojProject = {
  filePath: string;
  packages: CsprojPackage[];
};

const PACKAGE_REGEX =
  /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/g;

export async function findCsproj(dir: string): Promise<string | null> {
  const entries = await readdir(dir);
  const found = entries.find((f) => f.endsWith(".csproj"));

  if (found) {
    return join(dir, found);
  }

  const parent = join(dir, "..");
  if (parent === dir) {
    return null;
  }

  return findCsproj(parent);
}

// dir = the env only used for testing locally
export async function loadProject(
  dir = process.env.TEST_PROJ_DIR
    ? resolve(process.env.TEST_PROJ_DIR)
    : process.cwd(),
): Promise<CsprojProject | null> {
  const fp = await findCsproj(dir);

  if (!fp) {
    return null;
  }

  const xml = await readFile(fp, "utf-8");
  return {
    filePath: fp,
    packages: parsePackageReferences(xml),
  };
}

export function parsePackageReferences(xml: string): CsprojPackage[] {
  const packages: CsprojPackage[] = [];
  let match;

  while ((match = PACKAGE_REGEX.exec(xml)) !== null) {
    packages.push({
      id: match[1]!,
      version: match[2]!,
    });
  }
  return packages;
}
