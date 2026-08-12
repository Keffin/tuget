import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  findCsproj,
  loadProject,
  parsePackageReferences,
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
});

const createTempDir = async () => await mkdtemp(join(tmpdir(), "unit-test-"));
