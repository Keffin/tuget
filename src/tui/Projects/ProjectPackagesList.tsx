import { Text } from "ink";
import { NuGetSearchData } from "../../nuget-client/schemas.js";
import { CsprojProject } from "../../projects/project-finder.js";

interface Props {
  project: CsprojProject;
  latestMap: Map<string, NuGetSearchData>;
  selectedIndex: number;
}

export const ProjectPackagesList = ({ project, latestMap, selectedIndex }: Props) => {
  return (
    <>
      {project.packages.map((p, i) => {
        const latest = latestMap.get(p.id);
        const isOutdated = latest?.version && latest.version !== p.version;
        const isVulnerable = (latest?.vulnerabilities?.length ?? 0) > 0;
        const isDeprecated = !!latest?.deprecation;

        return (
          <Text key={p.id} color={i === selectedIndex ? "cyan" : undefined}>
            {i === selectedIndex ? "> " : "  "}
            {p.id}
            {isVulnerable && <Text color="red"> ⚠</Text>}
            {isDeprecated && !isVulnerable && <Text color="yellow"> ⚑</Text>}
            {isOutdated && !isVulnerable && !isDeprecated && (
              <Text color="yellow"> ↑</Text>
            )}
          </Text>
        );
      })}
    </>
  );
};
