export type CsprojPackage = {
  id: string;
  version: string;
}

export type CsprojProject = {
  filePath: string;
  packages: CsprojPackage[];
}


const PACKAGE_REGEX = /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/g;
export function parsePackageReferences(xml: string): CsprojPackage[]{

  const packages: CsprojPackage[] = [];
  let match;

  while ((match = PACKAGE_REGEX.exec(xml)) !== null) {
    packages.push({
      id: match[1]!,
      version: match[2]!
    });
  }
  return packages;
}
