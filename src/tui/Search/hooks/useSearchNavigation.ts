import { useEffect, useState } from "react";
import { SearchPackagesResult } from "../../types/types.js";
import { useInput } from "ink";
import { FORMATS } from "../utils.js";
import clipboard from "clipboardy";

export const useSearchNavigation = (results: SearchPackagesResult) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [formatIndex, setFormatIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useInput((_, key) => {
    if (key.return && results[selectedIndex]) {
      const pkg = results[selectedIndex];
      clipboard.writeSync(
        FORMATS[formatIndex]!.render(pkg.id ?? "", pkg.version ?? ""),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    if (key.upArrow) {
      setSelectedIndex((i) =>
        i === 0 ? results.length - 1 : Math.max(0, i - 1),
      );
    }

    if (key.downArrow) {
      setSelectedIndex((i) =>
        i === results.length - 1 ? 0 : Math.min(results.length - 1, i + 1),
      );
    }

    if (key.tab) {
      setFormatIndex((i) => (i + 1) % FORMATS.length);
    }
  });

  const currentFormat = FORMATS[formatIndex]!;
  return {
    selectedIndex,
    copied,
    currentFormat,
  };
};
