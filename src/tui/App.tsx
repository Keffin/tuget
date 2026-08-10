import {  useState } from "react";
import {  render, Text, useInput } from "ink";
import { SplashScreen } from "./SplashScreen.js";
import { Search } from "./Search/Search.js";

type View = "splash" | "search";

const App = () => {
  const [view, setView] = useState<View>("splash");

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
      if (input === "q") {
        process.exit(0);
      }
    }
  });

  if (view === "splash") {
    return <SplashScreen />;
  }
  if (view === "search") {
    return <Search />;
  }
};

export const startApp = async (): Promise<void> => {
  render(<App />);
};
