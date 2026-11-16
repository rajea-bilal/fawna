// Fawna's brick button (issue #18): a peach block with a clay side and studs on
// top. Pressing seats it: it drops 4px onto its side. While busy (aria-busy) it
// stays seated and the studs light up in turn, like the landing page snake.
// Used for the page's building actions: Mark worksheet, Next step, Next card.

export const brickButton =
  "group relative inline-flex min-h-[50px] cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-peach px-6 text-base font-semibold text-charcoal shadow-[0_5px_0_var(--color-clay)] transition-[translate,box-shadow,background-color] duration-[120ms] ease-snappy hover:bg-[#f4d6b8] active:shadow-[0_1px_0_var(--color-clay)] motion-safe:active:translate-y-1 aria-busy:cursor-wait aria-busy:shadow-[0_1px_0_var(--color-clay)] motion-safe:aria-busy:translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-[7px] focus-visible:outline-charcoal";

// Four studs on a card's top edge: what makes every card a brick (issue #18).
// Purely decorative, the same on every card, so cards without steps match too.
// Put inside a `relative` card that has about 10px of room above it.
export function CardStuds({ dashed = false }: { dashed?: boolean }) {
  return (
    // Studs shrink on a narrow card instead of hanging past its edge.
    <span aria-hidden className="pointer-events-none absolute -top-[10px] right-[22px] left-[22px] flex gap-[9px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`block h-[10px] max-w-8 min-w-3 flex-1 rounded-t-[4px] border border-b-0 bg-white ${dashed ? "border-dashed border-charcoal/35" : "border-charcoal"}`}
        />
      ))}
    </span>
  );
}

// The studs along the top edge. Put inside a `brickButton`, before the label.
export function BrickStuds({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute flex justify-between ${small ? "inset-x-3 -top-[5px]" : "inset-x-3.5 -top-[7px]"}`}
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 150}ms` }}
          className={`rounded-t-[3px] bg-peach shadow-[inset_0_2px_0_rgb(255_255_255/0.22)] motion-safe:group-aria-busy:animate-stud ${small ? "h-[5px] w-[13px]" : "h-[7px] w-[18px]"}`}
        />
      ))}
    </span>
  );
}
