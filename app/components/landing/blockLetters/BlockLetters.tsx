"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import StaticLetters from "./StaticLetters";
import {
  DEFAULT_BLOCK_LETTERS,
  FRAME_MARGIN,
  type BlockLettersConfig,
} from "./config";
import { LETTER_ROWS, wordWidth } from "./letterGrids";

// Three.js only ships to the browser, and only once the word is near the
// viewport. Until then the page carries the static SVG.
const BlockLettersCanvas = dynamic(() => import("./BlockLettersCanvas"), {
  ssr: false,
});

type Props = {
  word: string;
  config?: BlockLettersConfig;
  className?: string;
};

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export default function BlockLetters({
  word,
  config = DEFAULT_BLOCK_LETTERS,
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  // "static": SVG only. "loading": canvas mounted, SVG still showing.
  // "live": canvas has drawn its first frame, SVG removed.
  const [mode, setMode] = useState<"static" | "loading" | "live">("static");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!hasWebGL()) return;

    let near = false;
    const decide = () => {
      setMode((current) => {
        if (motion.matches || !near) return "static";
        return current === "static" ? "loading" : current;
      });
    };

    const nearViewport = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near = true;
        nearViewport.disconnect();
        decide();
      },
      { rootMargin: "320px" },
    );
    nearViewport.observe(host);
    motion.addEventListener("change", decide);

    return () => {
      nearViewport.disconnect();
      motion.removeEventListener("change", decide);
    };
  }, []);

  const aspect = `${wordWidth(word) + FRAME_MARGIN * 2} / ${LETTER_ROWS + FRAME_MARGIN * 2}`;

  return (
    <div
      ref={hostRef}
      className={`relative w-full ${className ?? ""}`}
      style={{ aspectRatio: aspect }}
    >
      {mode !== "live" && (
        <StaticLetters
          word={word}
          colors={config.colors}
          outlineWidth={config.outlineWidth}
          className="absolute inset-0 h-full w-full"
        />
      )}
      {mode !== "static" && (
        <BlockLettersCanvas
          word={word}
          config={config}
          className="absolute inset-0"
          onReady={() => setMode("live")}
        />
      )}
    </div>
  );
}
