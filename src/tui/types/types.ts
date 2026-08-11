import { searchPackages } from "../../nuget-client/nuget-client.js";

export type SearchPackagesResult = Awaited<ReturnType<typeof searchPackages>>;
export type Package = NonNullable<SearchPackagesResult[number]>;

export type Mode = "packages" | "versions";

// +4 for "> " and padding
export const PADDING = 4;

export const MAX_VERSIONS = 10;
