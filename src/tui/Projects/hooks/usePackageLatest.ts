import { useEffect, useState } from "react";
import { NuGetSearchData } from "../../../nuget-client/schemas.js";
import { getPackageLatestState } from "../../../nuget-client/nuget-client.js";

export const usePackageLatest = (packageId: string | undefined) => {
  const [latestData, setLatestData] = useState<NuGetSearchData | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!packageId) return;
    setLatestData(null);
    setFetching(true);
    getPackageLatestState(packageId)
      .then(setLatestData)
      .finally(() => setFetching(false));
  }, [packageId]);

  return { latestData, fetching };
};
