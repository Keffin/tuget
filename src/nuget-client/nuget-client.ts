export async function searchPackages(query: string) {
  const nugetSearchQuery = `https://azuresearch-usnc.nuget.org/query?q=${query}&prerelease=false&take=20`;

  const response = await fetch(nugetSearchQuery);

  const result: any = await response.json();

  for (const pkg of result.data) {
    console.log(pkg.id, pkg.version);
  }
}
