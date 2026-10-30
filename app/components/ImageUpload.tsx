"use client";

import Image from "next/image";
import { useState } from "react";
import shrinkImage from "@/lib/image/shrinkImage";
import { summariseResult, type WorksheetSummary } from "@/lib/ai/summariseResult";
import { SAMPLE_RESULT } from "@/lib/demo/sampleResult";
import { darkButton } from "./landing/buttonStyles";
import ResultsList from "./ResultsList";

const quietButton =
  "inline-flex items-center justify-center rounded-lg border border-ink/25 text-base font-semibold text-ink transition-colors hover:bg-ink/5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-espresso";

export default function ImageUpload() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [demoCode, setDemoCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<WorksheetSummary | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const max_file_size = 10 * 1024 * 1024; // 10 MB
    const types = ["image/png", "image/jpeg", "image/webp"];
    const file = e.target.files?.[0];

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
    <div className="grid gap-10">
      <section className="rounded-2xl border border-ink/10 bg-linen p-6 sm:p-8">
        <h2 className="font-display text-xl font-medium">See it in one click</h2>
        <p className="mt-1 text-ink/80">
          A worksheet Fawna has already marked. No photo or code needed.
        </p>
        <button
          type="button"
          onClick={handleSample}
          className={`${darkButton} mt-4 min-h-12 px-6`}
        >
          Try a sample worksheet
        </button>
      </section>

      <section className="grid gap-6 rounded-2xl border border-ink/10 p-6 sm:p-8 md:grid-cols-2">
        <div className="grid content-start gap-4">
          <h2 className="font-display text-xl font-medium">Mark your own</h2>

          <label className="grid gap-1 text-sm font-semibold">
            Demo code
            <input
              type="password"
              value={demoCode}
              onChange={(e) => setDemoCode(e.target.value)}
              autoComplete="off"
              className="min-h-11 rounded-lg border border-ink/25 bg-white px-3 text-base font-normal"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold">
            Worksheet photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelected}
              className="text-base font-normal file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border file:border-ink/25 file:bg-white file:px-4 file:font-semibold"
            />
          </label>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isMarking}
            className={`${quietButton} min-h-12 px-6 disabled:cursor-wait disabled:opacity-60`}
          >
            {isMarking ? "Marking… this can take a minute" : "Mark worksheet"}
          </button>

          <p className="text-sm text-ink/70">
            This is a demo. Please don’t upload photos that show a child’s name
            or face. Photos are sent to OpenAI to be marked and are not saved by
            Fawna.
          </p>

          {error && (
            <p role="alert" className="text-sm font-semibold text-terracotta">
              {error}
            </p>
          )}
        </div>

        <div className="relative min-h-64 rounded-xl border border-dashed border-ink/20 bg-paper">
          {imageURL ? (
            <Image
              src={imageURL}
              alt="Worksheet preview"
              fill
              className="object-contain p-2"
            />
          ) : (
            <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-ink/60">
              Your photo will show here
            </p>
          )}
        </div>
      </section>

      {summary && (
        <section aria-live="polite">
          {isSample && (
            <p className="mb-2 text-sm font-semibold tracking-wide text-rust uppercase">
              Sample result
            </p>
          )}
          <ResultsList summary={summary} />
        </section>
      )}
    </div>
  );
}
