import { describe, it, expect } from "vitest";
import { parsePackageReferences } from "./project-finder.js";

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
