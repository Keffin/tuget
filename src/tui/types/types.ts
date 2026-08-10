import { searchPackages } from "../../nuget-client/nuget-client.js";

export type SearchPackagesResult = Awaited<ReturnType<typeof searchPackages>>;
