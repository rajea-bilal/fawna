import BlockLetters from "./blockLetters/BlockLetters";

// The word is decorative 3D; the real heading is visually hidden so
// screen readers still get the section's name.
export default function PracticeSection() {
  return (
    <section
      aria-labelledby="practice-heading"
      className="bg-linen px-5 py-20 text-ink sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold tracking-[0.08em] uppercase text-ink/60">
          What comes next
        </p>
        <h2 id="practice-heading" className="sr-only">
          Practice
        </h2>
        <BlockLetters word="PRACTICE" className="mt-6" />
        <p className="mt-8 max-w-[46ch] text-lg leading-normal sm:text-xl">
          Every result ends with a few questions written for the gap we found.
          Ten minutes at the table, one skill at a time.
        </p>
      </div>
    </section>
  );
}
