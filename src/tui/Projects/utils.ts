export const addPackageCommand = ({ id, version }: { id: string, version?: string }): string => {
  return `add package ${id} --version ${version}`;
}

export const removePackageCommand = ({ id }: { id: string }): string => {
  return `remove package ${id}`;
};

export const formatDownloads = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
};

export const truncateDescription = (text: string, max = 200): string => {
  const firstPara = text.split(/\r?\n\r?\n/)[0]?.trim() ?? text;
  if (firstPara.length <= max) return firstPara;
  return firstPara.slice(0, max).trimEnd() + "…";
};
