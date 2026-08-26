import { useEffect, useState } from "react";
import { render, useInput } from "ink";
import { dirname } from "node:path";
import { SplashScreen } from "./SplashScreen.js";
import { Search } from "./Search/Search.js";
import {
  AppData,
  CsprojProject,
  loadAppData,
  loadProject,
} from "../projects/project-finder.js";
import { ProjectPackages } from "./Projects/ProjectPackages.js";
import { SolutionProjects } from "./Projects/SolutionProjects.js";

type View = "splash" | "solution" | "project" | "search";

const App = () => {
  const [view, setView] = useState<View>("splash");
  const [appData, setAppData] = useState<AppData>(null);
  const [selectedProject, setSelectedProject] = useState<CsprojProject | null>(null);

  const [installCallback, setInstallCallback] = useState<{
    fn: (id: string, version: string) => void;
  } | null>(null);

  useEffect(() => {
    loadAppData().then(setAppData);
  }, []);

  const openProject = (project: CsprojProject) => {
    setSelectedProject(project);
    setView("project");
  };

  const reloadProject = async () => {
    if (!selectedProject) return;
    const updated = await loadProject(dirname(selectedProject.filePath));
    if (!updated) return;
    setSelectedProject(updated);
    if (appData?.kind === "solution") {
      setAppData({
        kind: "solution",
        solution: {
          ...appData.solution,
          projects: appData.solution.projects.map((p) =>
            p.filePath === updated.filePath ? updated : p,
          ),
        },
      });
    }
  };

  const openInstallSearch = (cb: (id: string, version: string) => void) => {
    setInstallCallback({ fn: cb });
    setView("search");
  };

  useInput((input, key) => {
    if (key.escape) {
      if (view === "search") {
        setInstallCallback(null);
        setView(installCallback ? "project" : "splash");
      } else if (view === "project") {
        setView(appData?.kind === "solution" ? "solution" : "splash");
      } else if (view === "solution") {
        setView("splash");
      } else {
        process.exit(0);
      }
    }

    if (view === "splash") {
      if (input === "1") setView("search");
      if (input === "2") {
        if (appData?.kind === "solution") setView("solution");
        else if (appData?.kind === "project") openProject(appData.project);
      }
      if (input === "q") process.exit(0);
    }
  });

  if (view === "splash") return <SplashScreen appData={appData} />;

  if (view === "solution" && appData?.kind === "solution") {
    return (
      <SolutionProjects
        solution={appData.solution}
        onSelectProject={openProject}
      />
    );
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

  if (view === "project" && selectedProject) {
    return (
      <ProjectPackages
        project={selectedProject}
        onReload={reloadProject}
        onOpenInstallSearch={openInstallSearch}
      />
    );
  }
};

export const startApp = async (): Promise<void> => {
  render(<App />);
};
