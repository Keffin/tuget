import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { join } from "node:path";

export type CsprojPackage = {
  id: string;
  version: string | undefined;
};

export type CsprojProject = {
  filePath: string;
  packages: CsprojPackage[];
};

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

export async function findDirectoryPackageProps(
  dir: string,
): Promise<string | null> {
  const entries = await readdir(dir);
  if (entries.includes("Directory.Packages.props")) {
    return join(dir, "Directory.Packages.props");
  }

  const parent = join(dir, "..");
  if (parent === dir) {
    return null;
  }

  return findDirectoryPackageProps(parent);
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
  const packages = parsePackageReferences(xml);

  const propsPath = await findDirectoryPackageProps(dirname(fp));

  if (!propsPath) {
    return {
      filePath: fp,
      packages,
    };
  }

  const propsXml = await readFile(propsPath, "utf-8");
  const versions = parsePackageVersions(propsXml);
  return {
    filePath: fp,
    packages: packages.map((p) => ({
      ...p,
      version: p.version ?? versions.get(p.id),
    })),
  };
}

export function parsePackageVersions(xml: string): Map<string, string> {
  const regex = /<PackageVersion\s+Include="([^"]+)"\s+Version="([^"]+)"/g;
  const versions = new Map<string, string>();
  let match;

  while ((match = regex.exec(xml)) !== null) {
    versions.set(match[1]!, match[2]!);
  }

  return versions;
}

export function parsePackageReferences(xml: string): CsprojPackage[] {
  const regex =
    /<PackageReference\s+Include="([^"]+)"(?:\s+Version="([^"]+)")?/g;
  const packages: CsprojPackage[] = [];
  let match;

  while ((match = regex.exec(xml)) !== null) {
    packages.push({
      id: match[1]!,
      version: match[2]!,
    });
  }
  return packages;
}
