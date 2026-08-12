export const addPackageCommand = ({ id, version }: { id: string, version?: string }): string => {
  return `add package ${id} --version ${version}`;
}

export const removePackageCommand = ({ id }: { id: string }): string => {
  return `remove package ${id}`;
};
