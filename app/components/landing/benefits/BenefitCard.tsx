import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  body: string;
  /** The artwork for the bottom band. It fills a 16:10 box edge to edge. */
  art: ReactNode;
};

// One stamp-edged sheet: copy on top, artwork printed on the bottom half.
// The mask (stamp-edge) sits on the inner <article> so it cuts the copy and
// the artwork as one shape. The shadow (paper-shadow) sits on the outer <li>
// because a filter on the masked element would be cut off with it.
//
// On large screens each card is a subgrid of two rows, copy and art. The
// parent grid sizes those rows across all three cards, so every artwork
// starts at the same height even when one card has more text.
export default function BenefitCard({ eyebrow, title, body, art }: Props) {
  return (
    <li className="paper-shadow min-w-0 lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-y-0">
      <article className="stamp-edge bg-paper px-[1.6rem] pt-[1.6rem] lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-y-0 xl:px-[1.85rem] xl:pt-7">
        <div>
          <p className="mb-3 flex items-center gap-2.5 text-xs font-bold tracking-[0.12em] text-rust uppercase">
            <span
              aria-hidden
              className="size-[9px] border-[1.5px] border-print bg-print-orange"
            />
            {eyebrow}
          </p>
          <h3 className="mb-2.5 font-display text-[1.6rem] leading-[1.08] font-medium tracking-[-0.012em] text-ink lg:text-[1.45rem] xl:text-[1.6rem]">
            {title}
          </h3>
          <p className="mb-[1.4rem] max-w-[34ch] text-[0.95rem] leading-normal text-ink/85">
            {body}
          </p>
        </div>

        {/* Negative margins undo the card padding so the art meets the stamp edge. */}
        <div className="relative -mx-[1.6rem] aspect-[16/10] self-end overflow-hidden border-t-[1.5px] border-print bg-peach xl:-mx-[1.85rem]">
          {art}
        </div>
      </article>
    </li>
  );
}
