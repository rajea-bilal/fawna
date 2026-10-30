"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import shrinkImage from "@/lib/image/shrinkImage";
import {
  summariseResult,
  type WorksheetSummary,
} from "@/lib/ai/summariseResult";
import { SAMPLE_RESULT } from "@/lib/demo/sampleResult";
import { honeyButton, oliveButton } from "./landing/buttonStyles";
import ResultsList from "./ResultsList";

export default function ImageUpload() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [demoCode, setDemoCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<WorksheetSummary | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  // Results land below the fold, so bring them into view when they arrive
  // (sample or live). An effect, not the click handler: the section only
  // exists after React renders the new summary. Reduced motion: jump, no glide.
  useEffect(() => {
    if (!summary) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [summary]);

  // One path for both ways in: the file picker and drag-and-drop.
  const handleFile = async (file: File | undefined) => {
    setError(null);
    const max_file_size = 10 * 1024 * 1024; // 10 MB
    const types = ["image/png", "image/jpeg", "image/webp"];

    if (!file) {
      setError("Please choose a photo.");
      return;
    }

    if (file.size > max_file_size) {
      setError("That photo is too large. Please use one under 10 MB.");
      return;
    }

    if (!types.includes(file.type)) {
      setError("Please upload a JPEG, PNG or WebP image.");
      return;
    }

    // shrink the image
    try {
      const shrunkFile = await shrinkImage(file);
      setImageURL(URL.createObjectURL(shrunkFile));
      setUploadedFile(shrunkFile);
    } catch {
      setError("We couldn't open this photo. Please try another one.");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    // Without preventDefault the browser opens the photo in the tab.
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    // dragleave also fires when moving over a child; only reset on a real exit.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError("Please choose a photo first.");
      return;
    }
    setError(null);
    setIsMarking(true);
    try {
      const formData = new FormData();
      formData.append("worksheet", uploadedFile);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "x-demo-code": demoCode.trim() },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSummary(data);
      setIsSample(false);
    } catch {
      setError("We couldn't reach Fawna. Check your connection and try again.");
    } finally {
      setIsMarking(false);
    }
  };

  // No AI call: the saved result goes through the same counting as a live one.
  const handleSample = () => {
    setError(null);
    setSummary(summariseResult(SAMPLE_RESULT));
    setIsSample(true);
  };

  return (
    <div className="grid gap-12">
      <div className="grid gap-10">
        {/* The quick path. A stamp-edged sheet, like the landing page's cards. */}
        <div className="paper-shadow">
          <section className="stamp-edge flex flex-col gap-6 bg-paper p-7 sm:p-9 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-rust uppercase">
                No code needed
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight font-medium">
                See it in one click
              </h2>
              <p className="mt-2 max-w-[46ch] leading-relaxed text-ink/80">
                A Year 4 fractions sheet Fawna has already marked. See each
                answer checked and the skill behind every mistake.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSample}
              className={`${honeyButton} min-h-12 w-full shrink-0 px-6 md:w-auto`}
            >
              Try a sample worksheet
              <span aria-hidden>→</span>
            </button>
          </section>
        </div>

        <div className="paper-shadow">
          <section className="stamp-edge bg-paper p-7 sm:p-9">
            <h2 className="font-display text-2xl leading-tight font-medium">
              Mark your own
            </h2>
            <p className="mt-2 leading-relaxed text-ink/80">
              Three small steps. Take your time.
            </p>

            <ol className="mt-8 grid gap-8">
              <li className="grid grid-cols-[1.75rem_1fr] gap-3">
                <StepNumber>1</StepNumber>
                <label className="grid max-w-sm gap-1.5 text-sm font-semibold">
                  Demo code
                  <input
                    type="password"
                    value={demoCode}
                    onChange={(e) => setDemoCode(e.target.value)}
                    autoComplete="off"
                    placeholder="From your invite email"
                    className="min-h-11 rounded-md border-[1.5px] border-ink/30 bg-white px-3 text-base font-normal transition-[border-color,box-shadow] duration-150 ease-snappy placeholder:text-ink/40 focus:border-olive focus:ring-3 focus:ring-olive/20 focus:outline-none"
                  />
                </label>
              </li>

              <li className="grid grid-cols-[1.75rem_1fr] gap-3">
                <StepNumber>2</StepNumber>
                <div className="grid gap-1.5">
                  <p className="text-sm font-semibold">Worksheet photo</p>
                  {/* The whole board is the picker: click, tap or drop a photo on it.
                    The real input is visually hidden but still keyboard-focusable. */}
                  <label
                    onDragEnter={() => setIsDragging(true)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    data-dragging={isDragging || undefined}
                    className="pixel-grid relative grid min-h-64 cursor-pointer place-items-center overflow-hidden rounded-md border-2 border-dashed border-ink/25 bg-linen/60 transition-[border-color,background-color] duration-150 ease-[ease] hover:border-ink/50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-espresso data-dragging:border-honey data-dragging:bg-honey/15"
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                      className="sr-only"
                    />
                    {imageURL ? (
                      <>
                        <Image
                          key={imageURL}
                          src={imageURL}
                          alt="Worksheet preview"
                          fill
                          className="object-contain p-3 pb-14 motion-safe:animate-fade"
                        />
                        <span className="absolute bottom-3 rounded-md border-[1.5px] border-espresso bg-white px-3 py-1 text-sm font-semibold shadow-[2px_2px_0_var(--color-espresso)]">
                          Change photo
                        </span>
                      </>
                    ) : (
                      <span className="grid justify-items-center gap-3 p-6 text-center">
                        <PixelSheet />
                        <span className="font-display text-lg font-medium">
                          {isDragging
                            ? "Let go to add it"
                            : "Drop the worksheet here"}
                        </span>
                        <span className="text-sm text-ink/60">
                          or tap to choose a photo · JPEG, PNG or WebP, under 10
                          MB
                        </span>
                      </span>
                    )}
                  </label>
                </div>
              </li>

              <li className="grid grid-cols-[1.75rem_1fr] gap-3">
                <StepNumber>3</StepNumber>
                <div className="grid justify-items-start gap-3">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isMarking}
                    aria-busy={isMarking}
                    className={`${oliveButton} min-h-12 w-full px-6 sm:w-auto disabled:cursor-wait disabled:opacity-80 disabled:active:scale-100`}
                  >
                    {isMarking && <PixelSnake />}
                    {isMarking
                      ? "Fawna is marking… this can take a minute"
                      : "Mark worksheet"}
                  </button>
                  {error && (
                    <p
                      role="alert"
                      className="text-sm font-semibold text-terracotta"
                    >
                      {error}
                    </p>
                  )}
                </div>
              </li>
            </ol>

            <div aria-hidden className="pixel-trail mt-10" />
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              This is a demo. Please don’t upload photos that show a child’s
              name or face. Photos are sent to OpenAI to be marked and are not
              saved by Fawna.
            </p>
          </section>
        </div>
      </div>

      {summary && (
        <section
          ref={resultsRef}
          // A new key replays the entrance when the result changes.
          key={`${isSample}-${summary.message}`}
          aria-live="polite"
          // Fade only; the rows inside rise, so the movement isn't doubled.
          // scroll-mt leaves a little paper above the results after scrolling.
          className="scroll-mt-8 animate-fade"
        >
          {isSample && (
            <p className="mb-3 text-sm font-semibold tracking-wide text-rust uppercase">
              Sample result
            </p>
          )}
          <ResultsList summary={summary} />
        </section>
      )}
    </div>
  );
}

// One PRACTICE cube: honey front, espresso outline, brick side as a hard shadow.
function StepNumber({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="mt-0.5 grid size-7 place-items-center border-[1.5px] border-espresso bg-honey font-display text-sm font-semibold text-espresso shadow-[2px_2px_0_var(--color-brick)]"
    >
      {children}
    </span>
  );
}

// Functional: shows the AI is still working. Three pixels hop across a
// 48px track, honey head in front. Reduced motion: the snake sits still.
function PixelSnake() {
  return (
    <span aria-hidden className="relative h-[5px] w-12 overflow-hidden">
      <span className="absolute inset-y-0 left-0 flex gap-px motion-safe:animate-snake">
        <span className="size-[5px] bg-linen/50" />
        <span className="size-[5px] bg-linen/80" />
        <span className="size-[5px] bg-honey" />
      </span>
    </span>
  );
}

// A blank worksheet drawn in pixels: white sheet, honey lines of writing.
function PixelSheet() {
  return (
    <svg
      aria-hidden
      width="48"
      height="56"
      viewBox="0 0 12 14"
      shapeRendering="crispEdges"
    >
      <rect
        x="0.5"
        y="0.5"
        width="11"
        height="13"
        fill="white"
        stroke="var(--color-espresso)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <rect x="2" y="3" width="7" height="1" fill="var(--color-honey)" />
      <rect x="2" y="6" width="5" height="1" fill="var(--color-honey)" />
      <rect x="2" y="9" width="6" height="1" fill="var(--color-honey)" />
    </svg>
  );
}
