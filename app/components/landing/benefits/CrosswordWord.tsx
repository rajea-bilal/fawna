// Words set as a filled-in crossword answer: one olive cell per letter,
// a small clue number in the first cell. Purely visual, so it is hidden
// from screen readers. The heading carries the same words as real text.
//
// Cell size lives in one CSS variable (--cell) so the letters, the squares
// and the gaps all scale together at each breakpoint.

type Props = {
  words: string[];
  clueNumber?: number;
  className?: string;
};

export default function CrosswordWord({
  words,
  clueNumber = 1,
  className = "",
}: Props) {
  return (
    <span
      aria-hidden
      className={`flex flex-wrap gap-x-3 gap-y-1.5 [--cell:31px] sm:gap-x-3.5 sm:[--cell:38px] lg:[--cell:44px] ${className}`}
    >
      {words.map((word, w) => (
        // Each word is its own flex row, so a line can only break between words.
        <span key={word} className="flex gap-[3px] sm:gap-1">
          {[...word].map((letter, i) => (
            <span
              key={i}
              className="relative grid size-(--cell) place-items-center bg-olive font-sans text-[calc(var(--cell)*0.56)] leading-none font-medium tracking-normal text-linen uppercase"
            >
              {w === 0 && i === 0 && (
                <span className="absolute top-[3px] left-1 text-[8px] leading-none font-bold opacity-75">
                  {clueNumber}
                </span>
              )}
              {letter}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
