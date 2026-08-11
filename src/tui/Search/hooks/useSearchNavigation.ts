import { useEffect, useMemo, useState } from "react";
import { MAX_VERSIONS, Mode, SearchPackagesResult } from "../../types/types.js";
import { useInput } from "ink";
import { FORMATS } from "../utils.js";
import clipboard from "clipboardy";

export const useSearchNavigation = (results: SearchPackagesResult) => {
  // navigation
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [mode, setMode] = useState<Mode>("packages");
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(0);

  const pkg = results[selectedIndex];
  const reversedVersions = useMemo(
    () => [...(pkg?.versions ?? [])].reverse().slice(0, MAX_VERSIONS),
    [pkg],
  );

  // UI feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [formatIndex, setFormatIndex] = useState<number>(0);


  useEffect(() => {
    setSelectedIndex(0);
    setMode("packages");
  }, [results]);

  useInput((_, key) => {
    if (key.return && pkg) {
      const version =
        mode === "versions"
          ? (reversedVersions[selectedVersionIndex]?.version ?? pkg.version)
          : pkg.version;

      clipboard.writeSync(
        FORMATS[formatIndex]!.render(pkg.id ?? "", version ?? ""),
      );

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    if (key.rightArrow && pkg && mode === "packages") {
      if (pkg.versions && pkg.versions.length > 0) {
        setSelectedVersionIndex(0);
        setMode("versions");
      }
    }

    if (key.leftArrow && mode === "versions") {
      setMode("packages");
    }

    if (key.upArrow) {
      navigateUp();
    }

    if (key.downArrow) {
      navigateDown();
    }

    if (key.tab) {
      setFormatIndex((i) => (i + 1) % FORMATS.length);
    }
  });

  const navigateUp = () => {
    if (mode === "versions") {
      setSelectedVersionIndex((i) =>
        i === 0 ? reversedVersions.length - 1 : i - 1,
      );
    } else {
      setSelectedIndex((i) => (i === 0 ? results.length - 1 : i - 1));
    }
  };

  const navigateDown = () => {
    if (mode === "versions") {
      setSelectedVersionIndex((i) =>
        i === reversedVersions.length - 1 ? 0 : i + 1,
      );
    } else {
      setSelectedIndex((i) => (i === results.length - 1 ? 0 : i + 1));
    }
  };

  const currentFormat = FORMATS[formatIndex]!;
  return {
    selectedIndex,
    selectedVersionIndex,
    mode,
    copied,
    currentFormat,
  };
};
