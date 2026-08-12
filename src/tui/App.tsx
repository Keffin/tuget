import { useEffect, useState } from "react";
import { render, Text, useInput } from "ink";
import { SplashScreen } from "./SplashScreen.js";
import { Search } from "./Search/Search.js";
import { CsprojProject, loadProject } from "../projects/project-finder.js";

type View = "splash" | "search" | "project";

const App = () => {
  const [view, setView] = useState<View>("splash");
  const [project, setProject] = useState<CsprojProject | null>(null);

  useEffect(() => {
    loadProject().then(setProject);
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      if (view === "search") {
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
    return <Search />;
  }
  if (view === "project") {
    // TODO: implement this
    process.exit(0);
  }
};

export const startApp = async (): Promise<void> => {
  render(<App />);
};
