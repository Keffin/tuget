import { NuGetSearchData, NuGetSearchResponseSchema } from "./schemas.js";

export async function searchPackages(
  query: string,
): Promise<NuGetSearchData[]> {
  const nugetSearchQuery = `https://azuresearch-usnc.nuget.org/query?q=${query}&prerelease=false&take=20`;

  const response = await fetch(nugetSearchQuery);

  const result = await response.json();

  const typed = await NuGetSearchResponseSchema.safeParseAsync(result);

  if (!typed.success) {
    return [];
  }

  return typed.data.data;
}
