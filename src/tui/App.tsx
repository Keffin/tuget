import { useEffect, useState } from "react";
import { render, Text, useInput } from "ink";
import { SplashScreen } from "./SplashScreen.js";
import { Search } from "./Search/Search.js";
import { CsprojProject, loadProject } from "../projects/project-finder.js";
import { ProjectPackages } from "./Projects/ProjectPackages.js";

type View = "splash" | "search" | "project";

const App = () => {
  const [view, setView] = useState<View>("splash");
  const [project, setProject] = useState<CsprojProject | null>(null);

  const [installCallback, setInstallCallback] = useState<{
    fn: (id: string, version: string) => void;
  } | null>(null);

  const openInstallSearch = (cb: (id: string, version: string) => void) => {
    setInstallCallback({ fn: cb });
    setView("search");
  };
  const reloadProject = async () => {
    const updated = await loadProject();
    setProject(updated);
  };

  useEffect(() => {
    loadProject().then(setProject);
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      if (view === "search") {
        setInstallCallback(null);
        setView(installCallback ? "project" : "splash");
      } else if (view === "project") {
        setView("splash");
      } else {
        process.exit(0);
      }
    }

    if (view === "splash") {
      if (input === "1") {
        setView("search");
      }
      if (input === "2" && project) {
        setView("project");
      }
      if (input === "q") {
        process.exit(0);
      }
    }
  });

  if (view === "splash") {
    return <SplashScreen project={project} />;
  }
  if (view === "search") {
    return (
      <Search
        onInstall={
          installCallback
            ? (id, version) => {
                installCallback.fn(id, version);
                setInstallCallback(null);
                setView("project");
              }
            : undefined
        }
      />
    );
  }
  if (view === "project" && project) {
    return (
      <ProjectPackages
        project={project}
        onReload={reloadProject}
        onOpenInstallSearch={openInstallSearch}
      />
    );
  }
};

export const startApp = async (): Promise<void> => {
  render(<App />);
};
