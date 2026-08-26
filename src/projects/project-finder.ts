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

export type SlnxSolution = {
  filePath: string;
  projects: CsprojProject[];
};

export type AppData =
  | { kind: "solution"; solution: SlnxSolution }
  | { kind: "project"; project: CsprojProject }
  | null;

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

export async function findSlnx(dir: string): Promise<string | null> {
  const entries = await readdir(dir);
  const found = entries.find((f) => f.endsWith(".slnx"));
  if (found) return join(dir, found);
  const parent = join(dir, "..");
  if (parent === dir) return null;
  return findSlnx(parent);
}

export function parseSlnxProjectPaths(xml: string): string[] {
  const regex = /<Project\s+Path="([^"]+)"/g;
  const paths: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    paths.push(match[1]!);
  }
  return paths;
}

async function loadProjectFromPath(csprojPath: string): Promise<CsprojProject> {
  const csprojDir = dirname(csprojPath);
  const xml = await readFile(csprojPath, "utf-8");
  const packages = parsePackageReferences(xml);

  const propsPath = await findDirectoryPackageProps(csprojDir);
  if (!propsPath) return { filePath: csprojPath, packages };

  const propsXml = await readFile(propsPath, "utf-8");
  const versions = parsePackageVersions(propsXml);
  return {
    filePath: csprojPath,
    packages: packages.map((p) => ({
      ...p,
      version: p.version ?? versions.get(p.id),
    })),
  };
}

export async function loadSolution(
  dir = process.env.TEST_PROJ_DIR
    ? resolve(process.env.TEST_PROJ_DIR)
    : process.cwd(),
): Promise<SlnxSolution | null> {
  const slnxPath = await findSlnx(dir);
  if (!slnxPath) return null;

  const xml = await readFile(slnxPath, "utf-8");
  const slnxDir = dirname(slnxPath);
  const relativePaths = parseSlnxProjectPaths(xml);

  const results = await Promise.all(
    relativePaths
      .filter((p) => p.endsWith(".csproj"))
      .map((rel) =>
        loadProjectFromPath(resolve(slnxDir, rel)).catch(() => null),
      ),
  );

  return {
    filePath: slnxPath,
    projects: results.filter((p): p is CsprojProject => p !== null),
  };
}

export async function loadAppData(
  dir = process.env.TEST_PROJ_DIR
    ? resolve(process.env.TEST_PROJ_DIR)
    : process.cwd(),
): Promise<AppData> {
  const solution = await loadSolution(dir);
  if (solution) return { kind: "solution", solution };
  const project = await loadProject(dir);
  if (project) return { kind: "project", project };
  return null;
}
