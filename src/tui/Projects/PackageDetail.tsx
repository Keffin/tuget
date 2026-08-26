import { Box, Text } from "ink";
import { NuGetSearchData } from "../../nuget-client/schemas.js";
import { CsprojPackage } from "../../projects/project-finder.js";
import { formatDownloads, truncateDescription } from "./utils.js";

interface Props {
  pkg: CsprojPackage;
  latestData: NuGetSearchData | null;
  fetching: boolean;
}

export const PackageDetail = ({ pkg, latestData, fetching }: Props) => (
  <Box flexDirection="column">
    <Text bold>{pkg.id}</Text>
    <Text>
      Installed: <Text color="cyan">{pkg.version ?? "—"}</Text>
    </Text>
    {fetching && <Text dimColor>Fetching latest...</Text>}
    {!fetching && latestData && (
      <Text>
        Latest:{" "}
        <Text color={latestData.version !== pkg.version ? "yellow" : "green"}>
          {latestData.version}
        </Text>
      </Text>
    )}
    {latestData?.deprecation && (
      <Text color="yellow">
        ⚑ Deprecated:{" "}
        {latestData.deprecation.message ??
          latestData.deprecation.reasons?.join(", ")}
      </Text>
    )}
    {(latestData?.vulnerabilities?.length ?? 0) > 0 && (
      <Text color="red">
        ⚠ {latestData!.vulnerabilities!.length} vulnerabilit
        {latestData!.vulnerabilities!.length === 1 ? "y" : "ies"}
      </Text>
    )}
    {!fetching && latestData && (
      <Box flexDirection="column" marginTop={1}>
        {latestData.description && (
          <Text wrap="wrap" dimColor>
            {truncateDescription(latestData.description)}
          </Text>
        )}
        <Box flexDirection="column" marginTop={1}>
          {(latestData.authors?.length ?? 0) > 0 && (
            <Text>
              <Text dimColor>by   </Text>
              {latestData.authors!.join(", ")}
            </Text>
          )}
          <Text>
            <Text dimColor>↓    </Text>
            {formatDownloads(latestData.totalDownloads)}
          </Text>
          {(latestData.licenseExpression ?? latestData.licenseUrl) && (
            <Text>
              <Text dimColor>lic  </Text>
              {latestData.licenseExpression ?? latestData.licenseUrl}
            </Text>
          )}
          {(latestData.tags?.length ?? 0) > 0 && (
            <Text dimColor>
              #    {latestData.tags!.slice(0, 5).join("  ")}
            </Text>
          )}
          {latestData.projectUrl && (
            <Text dimColor>{latestData.projectUrl}</Text>
          )}
        </Box>
      </Box>
    )}
  </Box>
);
