import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  findCsproj,
  findDirectoryPackageProps,
  loadProject,
  parsePackageReferences,
  parsePackageVersions,
} from "./project-finder.js";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import os, { tmpdir } from "node:os";
import { join } from "node:path";

describe("parsePackageReferences", () => {
  it("parses a single package reference", () => {
    // Arrange
    const xml = `<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />`;

    // Act
    const parsed = parsePackageReferences(xml);

    // Assert
    expect(parsed).toEqual([{ id: "Newtonsoft.Json", version: "13.0.3" }]);
  });

  it("parses multiple package references", () => {
    // Arrange
    const xml = `
            <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
            <PackageReference Include="Dapper" Version="2.1.28" />
    `;

    // Act
    const parsed = parsePackageReferences(xml);

    // Assert
    expect(parsed).toEqual([
      { id: "Newtonsoft.Json", version: "13.0.3" },
      { id: "Dapper", version: "2.1.28" },
    ]);
  });

  it("empty array when no package references found", () => {
    // Arrange, Act
    const parsed = parsePackageReferences(
      `<Project Sdk="Microsoft.NET.Sdk"></Project>`,
    );

    // Assert
    expect(parsed).toEqual([]);
  });

  it("parses a bare PackageReference with no version (CPM style)", () => {
    // Arrange
    const xml = `<PackageReference Include="Newtonsoft.Json" />`;

    // Act
    const parsed = parsePackageReferences(xml);

    // Assert
    expect(parsed).toEqual([{ id: "Newtonsoft.Json", version: undefined }]);
  });

  it("handles mixed versioned and bare references", () => {
    // Arrange
    const xml = `
       <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
       <PackageReference Include="Dapper" />
     `;

    // Act
    const parsed = parsePackageReferences(xml);

    // Assert
    expect(parsed).toEqual([
      { id: "Newtonsoft.Json", version: "13.0.3" },
      { id: "Dapper", version: undefined },
    ]);
  });
});

describe("parsePackageVersions", () => {
  it("parses a single PackageVersion entry", () => {
    // Arrange
    const xml = `<PackageVersion Include="Newtonsoft.Json" Version="13.0.3" />`;

    // Act
    const parsed = parsePackageVersions(xml);

    // Assert
    expect(parsed).toEqual(new Map([["Newtonsoft.Json", "13.0.3"]]));
  });

  it("parses multiple entries", () => {
    // Arrange
    const xml = `
      <PackageVersion Include="Newtonsoft.Json" Version="13.0.3" />
      <PackageVersion Include="Dapper" Version="2.1.28" />
    `;

    // Act
    const parsed = parsePackageVersions(xml);

    // Assert
    expect(parsed).toEqual(
      new Map([
        ["Newtonsoft.Json", "13.0.3"],
        ["Dapper", "2.1.28"],
      ]),
    );
  });

  it("returns empty map when no PackageVersion entries found", () => {
    // Arrange, Act
    const parsed = parsePackageVersions(`<Project></Project>`);

    // Assert
    expect(parsed).toEqual(new Map());
  });

  it("does not match PackageReference elements", () => {
    // Arrange
    const xml = `<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />`;

    // Act
    const parsed = parsePackageVersions(xml);

    // Assert
    expect(parsed).toEqual(new Map());
  });
});

describe("findCsproj", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await createTempDir();
  });
  afterEach(async () => {
    await rm(dir, { recursive: true });
  });

  it("returns path when .csproj found in directory", async () => {
    // Arrange
    await writeFile(join(dir, "MyApp.csproj"), "");

    // Act
    const fp = await findCsproj(dir);

    // Assert
    expect(fp).toBe(join(dir, "MyApp.csproj"));
  });
  it("walk up to parent when no .csproj in current directory", async () => {
    // Arrange
    await writeFile(join(dir, "MyApp.csproj"), "");
    const subdir = join(dir, "src");
    await mkdir(subdir);

    // Act
    const fp = await findCsproj(subdir);

    // Assert
    expect(fp).toBe(join(dir, "MyApp.csproj"));
  });
  it("null when no .csproj exists", async () => {
    // Arrange, Act, Assert
    expect(await findCsproj(dir)).toBeNull();
  });
});

describe("findDirectoryPackagesProps", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await createTempDir();
  });
  afterEach(async () => {
    await rm(dir, { recursive: true });
  });

  it("returns path when Directory.Packages.props found in same directory", async () => {
    // Arrange
    await writeFile(join(dir, "Directory.Packages.props"), "");

    // Act
    const fp = await findDirectoryPackageProps(dir);

    // Assert
    expect(fp).toBe(join(dir, "Directory.Packages.props"));
  });

  it("walks up to parent when not found in current directory", async () => {
    // Arrange
    await writeFile(join(dir, "Directory.Packages.props"), "");
    const subdir = join(dir, "src");
    await mkdir(subdir);

    // Act
    const fp = await findDirectoryPackageProps(subdir);

    // Assert
    expect(fp).toBe(join(dir, "Directory.Packages.props"));
  });

  it("returns null when no Directory.Packages.props exists", async () => {
    expect(await findDirectoryPackageProps(dir)).toBeNull();
  });

  it("finds file multiple levels up", async () => {
    // Arrange
    await writeFile(join(dir, "Directory.Packages.props"), "");
    const deep = join(dir, "src", "MyApp");
    await mkdir(deep, { recursive: true });

    // Act
    const fp = await findDirectoryPackageProps(deep);

    // Assert
    expect(fp).toBe(join(dir, "Directory.Packages.props"));
  });
});

describe("loadProject", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await createTempDir();
  });
  afterEach(async () => {
    await rm(dir, { recursive: true });
  });

  it("null when no .csproj found", async () => {
    // Arrange, Act, Assert
    expect(await loadProject(dir)).toBeNull();
  });
  it("returns project with parsed packages", async () => {
    // Arrange
    await writeFile(
      join(dir, "MyApp.csproj"),
      `<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />`,
    );

    // Act
    const project = await loadProject(dir);

    // Assert
    expect(project).toEqual({
      filePath: join(dir, "MyApp.csproj"),
      packages: [{ id: "Newtonsoft.Json", version: "13.0.3" }],
    });
  });
  it("resolves versions from Directory.Packages.props when PackageReference has no version", async () => {
    // Arrange
    await writeFile(
      join(dir, "MyApp.csproj"),
      `<PackageReference Include="Newtonsoft.Json" />`,
    );
    await writeFile(
      join(dir, "Directory.Packages.props"),
      `<PackageVersion Include="Newtonsoft.Json" Version="13.0.3" />`,
    );

    // Act
    const project = await loadProject(dir);

    // Assert
    expect(project?.packages).toEqual([
      { id: "Newtonsoft.Json", version: "13.0.3" },
    ]);
  });

  it("prefers inline version over Directory.Packages.props", async () => {
    // Arrange
    await writeFile(
      join(dir, "MyApp.csproj"),
      `<PackageReference Include="Newtonsoft.Json" Version="12.0.0" />`,
    );
    await writeFile(
      join(dir, "Directory.Packages.props"),
      `<PackageVersion Include="Newtonsoft.Json" Version="13.0.3" />`,
    );

    // Act
    const project = await loadProject(dir);

    // Assert
    expect(project?.packages).toEqual([
      { id: "Newtonsoft.Json", version: "12.0.0" },
    ]);
  });

  it("leaves version undefined when not in csproj or Directory.Packages.props", async () => {
    // Arrange
    await writeFile(
      join(dir, "MyApp.csproj"),
      `<PackageReference Include="Newtonsoft.Json" />`,
    );

    // Act
    const project = await loadProject(dir);

    // Assert
    expect(project?.packages).toEqual([
      { id: "Newtonsoft.Json", version: undefined },
    ]);
  });
});

const createTempDir = async () => await mkdtemp(join(tmpdir(), "unit-test-"));
