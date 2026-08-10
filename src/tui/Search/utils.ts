type Format = {
  label: string;
  render: (id: string, version: string) => string;
}
export const FORMATS: Format[] = [
  {
    label: "XML",
    render: (id: string, version: string): string =>
      `<PackageReference Include="${id}" Version="${version}" />`,
  },
  {
    label: "dotnet CLI",
    render: (id: string, version: string): string =>
      `dotnet add package ${id} --version ${version}`,
  },

  // TODO: Add more formats
];
