"use client";

import { useRef } from "react";
import { quietLink } from "./buttonStyles";

// A made-up example of one mistake and one practice question.
// Based on a common pattern from the golden set (Q2), not on a real child's work.
export default function ExamplePreview() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // showModal() gives us a focus trap and Escape-to-close for free.
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className={quietLink}
      >
        See an example
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="example-title"
        // Escape and close() both fire "close". Send focus back to the trigger.
        onClose={() => triggerRef.current?.focus()}
        // A click on the backdrop lands on the dialog element itself.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-ivory p-0 text-forest-deep shadow-xl backdrop:bg-forest-deep/40"
      >
        <div className="p-6 sm:p-8">
          <p className="text-sm font-semibold tracking-wide text-terracotta uppercase">
            Illustrative example
          </p>
          <h2
            id="example-title"
            className="mt-1 font-display text-2xl font-semibold"
          >
            From one mistake to one practice question
          </h2>
          <p className="mt-2 text-sm text-forest-deep/70">
            Made up to show the idea. Not a real child’s work.
          </p>

          <h3 className="mt-6 text-sm font-semibold">On the worksheet</h3>
          <p className="mt-1 tabular-nums text-lg">
            66 ÷ 1000 ={" "}
            <span className="text-terracotta line-through decoration-2">
              0.66
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed">
            The right answer is <span className="tabular-nums">0.066</span>. The
            digits moved 2 places instead of 3.
          </p>

          <h3 className="mt-6 text-sm font-semibold">Skill to work on</h3>
          <p className="mt-1 text-sm">Dividing by 10, 100, 1000</p>

          <h3 className="mt-6 text-sm font-semibold">Practice question</h3>
          <p className="mt-1 tabular-nums text-lg">47 ÷ 1000 = ?</p>
          <p className="mt-1 text-sm text-forest-deep/70">
            Answer: <span className="tabular-nums">0.047</span>
          </p>

          <button
            type="button"
            onClick={close}
            className="mt-8 min-h-11 w-full rounded-lg border-2 border-forest px-5 font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
