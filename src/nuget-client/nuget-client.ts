import { NuGetSearchData, NuGetSearchResponseSchema } from "./schemas.js";

export async function searchPackages(
  query: string,
  signal?: AbortSignal,
): Promise<NuGetSearchData[]> {
  const nugetSearchQuery = `https://azuresearch-usnc.nuget.org/query?q=${query}&prerelease=false&take=20`;

  const response = await fetch(nugetSearchQuery, { signal });

  const result = await response.json();

  const typed = await NuGetSearchResponseSchema.safeParseAsync(result);

  if (!typed.success) {
    return [];
  }

  return typed.data.data;
}

export async function getPackageLatestState(
  id: string,
  signal?: AbortSignal,
): Promise<NuGetSearchData | null> {
  const url = `https://azuresearch-usnc.nuget.org/query?q=packageid:${id}&prerelease=false&take=1`;

  const response = await fetch(url, { signal });

  const result = await response.json();

  const typed = await NuGetSearchResponseSchema.safeParseAsync(result);

  if (!typed.success) {
    return null;
  }

  return typed.data.data[0] ?? null;
}
