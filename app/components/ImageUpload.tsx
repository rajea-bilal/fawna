"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import shrinkImage from "@/lib/image/shrinkImage";
import {
  summariseResult,
  type WorksheetSummary,
} from "@/lib/ai/summariseResult";
import { SAMPLE_RESULT } from "@/lib/demo/sampleResult";
import { SAMPLE_EXPLANATIONS } from "@/lib/demo/sampleExplanations";
import BuildingBricks from "./BuildingBricks";
import { BrickStuds, brickButton } from "./brickButton";
import ResultsList from "./ResultsList";

// Upload page styles (issue #18), matching the results below the form.
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-charcoal";
const pressable =
  "cursor-pointer transition-[background-color,scale] duration-150 ease-snappy motion-safe:active:scale-[0.97]";
// Quieter actions: a soft honey tint.
const softButton = `${pressable} inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-honey/16 px-6 text-base font-semibold text-charcoal hover:bg-honey/26 ${focusRing}`;
const label = "text-xs font-semibold tracking-[0.13em] text-dusk uppercase";

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
        {/* The quick path: a slim ruled row, no card. */}
        <section className="flex flex-col gap-5 border-y border-charcoal/16 py-6 md:flex-row md:items-center md:justify-between md:gap-10">
          <div>
            <p className={label}>No code needed</p>
            <h2 className="mt-2 text-[22px] leading-tight font-semibold tracking-[-0.01em]">
              See it in one click
            </h2>
            <p className="mt-1.5 max-w-[50ch] leading-relaxed text-dusk">
              A Year 4 fractions sheet Fawna has already marked. See each
              answer checked and the skill behind every mistake.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSample}
            className={`${softButton} w-full shrink-0 md:w-auto`}
          >
            Try a sample worksheet
            <ArrowIcon />
          </button>
        </section>

        {/* The full path, on one brick-bodied card like the explanation cards:
          a fine outline and a solid peach shade. */}
        <div className="mr-[7px]">
          <section className="rounded-[3px] border border-charcoal bg-white p-7 shadow-[7px_7px_0_var(--color-peach)] sm:p-9">
            <h2 className="text-2xl leading-tight font-semibold tracking-[-0.01em]">
              Mark your own
            </h2>
            <p className="mt-1.5 leading-relaxed text-dusk">
              Three small steps. Take your time.
            </p>

            <ol className="mt-8 grid gap-8">
              <li className="grid grid-cols-[30px_1fr] gap-x-3.5">
                <StepNumber>1</StepNumber>
                <label className="grid max-w-sm gap-1.5 text-sm font-semibold">
                  Demo code
                  <input
                    type="password"
                    value={demoCode}
                    onChange={(e) => setDemoCode(e.target.value)}
                    autoComplete="off"
                    placeholder="From your invite email"
                    className="min-h-11 rounded-lg border border-charcoal/20 bg-white px-3 text-base font-normal transition-[border-color,box-shadow] duration-150 ease-snappy placeholder:text-dusk/70 focus:border-honey-deep focus:ring-3 focus:ring-honey/25 focus:outline-none"
                  />
                </label>
              </li>

              <li className="grid grid-cols-[30px_1fr] gap-x-3.5">
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
                    className="group relative grid min-h-64 cursor-pointer place-items-center overflow-hidden rounded-xl border-[1.5px] border-dashed border-charcoal/20 bg-canvas transition-[border-color,background-color] duration-150 ease-[ease] hover:border-charcoal/40 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-charcoal data-dragging:border-honey-deep data-dragging:bg-honey/10"
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
                        <span className="absolute bottom-3 rounded-full border border-charcoal/16 bg-white px-3.5 py-1.5 text-sm font-semibold shadow-sm">
                          Change photo
                        </span>
                      </>
                    ) : (
                      <span className="grid justify-items-center gap-2.5 p-6 text-center">
                        {/* Fawna's bricks, at rest. The top one lifts a little on hover,
                          and higher while a photo is dragged over: "ready for it". */}
                        <BuildingBricks
                          still
                          className="mb-1 w-[104px]"
                          liftClassName="motion-safe:group-hover:-translate-y-1.5 motion-safe:group-data-dragging:-translate-y-4"
                          shadowClassName="group-hover:opacity-[0.05] group-data-dragging:opacity-[0.1]"
                        />
                        <span className="text-lg font-semibold">
                          {isDragging
                            ? "Let go to add it"
                            : "Drop the worksheet here"}
                        </span>
                        <span className="text-sm text-dusk">
                          or tap to choose a photo · JPEG, PNG or WebP, under 10
                          MB
                        </span>
                      </span>
                    )}
                  </label>
                </div>
              </li>

              <li className="grid grid-cols-[30px_1fr] gap-x-3.5">
                <StepNumber>3</StepNumber>
                <div className="grid justify-items-start gap-4">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isMarking}
                    aria-busy={isMarking}
                    className={`mt-2 ${brickButton}`}
                  >
                    {/* While marking, the studs light up in turn. */}
                    <BrickStuds />
                    {isMarking ? "Marking…" : "Mark worksheet"}
                  </button>
                  {/* Same building bricks as the card loader: one "working on it" picture. */}
                  {isMarking && (
                    <div
                      role="status"
                      className="flex items-center gap-4 motion-safe:animate-fade"
                    >
                      <BuildingBricks className="w-[72px] shrink-0" />
                      <span className="shimmer-text text-[15px] font-semibold">
                        Fawna is marking… this can take a minute
                      </span>
                    </div>
                  )}
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

            <p className="mt-10 border-t border-charcoal/16 pt-5 text-sm leading-relaxed text-dusk">
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
          // scroll-mt leaves a little room above the results after scrolling.
          className="scroll-mt-8 animate-fade"
        >
          {isSample && <p className={`mb-4 ${label}`}>Sample result</p>}
          <ResultsList
            summary={summary}
            explanations={isSample ? SAMPLE_EXPLANATIONS : undefined}
            demoCode={isSample ? undefined : demoCode.trim()}
          />
        </section>
      )}
    </div>
  );
}

// A step number: the same thin circle as the card stepper.
function StepNumber({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="grid size-[30px] place-items-center rounded-full border border-charcoal/16 text-sm font-semibold text-dusk tabular-nums"
    >
      {children}
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="size-[1em] text-honey-deep"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 10h13M11 4.5l5.5 5.5-5.5 5.5" />
    </svg>
  );
}
