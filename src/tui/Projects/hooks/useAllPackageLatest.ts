import { useEffect, useState } from "react";
import { CsprojPackage } from "../../../projects/project-finder.js";
import { NuGetSearchData } from "../../../nuget-client/schemas.js";
import { getPackageLatestState } from "../../../nuget-client/nuget-client.js";

export const useAllPackageLatest = (packages: CsprojPackage[]) => {
  const [latestMap, setLatestMap] = useState<Map<string, NuGetSearchData>>(
    new Map(),
  );
  const [allFetching, setAllFetching] = useState<boolean>(false);

  useEffect(() => {
    if (packages.length === 0) {
      return;
    }

    setAllFetching(true);
    Promise.all(packages.map((p) => getPackageLatestState(p.id)))
      .then((res) => {
        const map = new Map<string, NuGetSearchData>();

        res.forEach((data, i) => {
          if (data) {
            map.set(packages[i]!.id, data);
          }
        });
        setLatestMap(map);
      })
      .finally(() => setAllFetching(false));
  }, [packages]);

  return { latestMap, allFetching };
};
