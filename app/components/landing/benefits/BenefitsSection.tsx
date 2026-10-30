import Image from "next/image";
import Link from "next/link";
import collage from "@/public/images/worksheet-collage.jpg";
import { darkButton } from "../buttonStyles";
import BenefitCard from "./BenefitCard";
import CrosswordWord from "./CrosswordWord";
import FractionsSheetArt from "./FractionsSheetArt";
import TonightSlipArt from "./TonightSlipArt";

// The three-step story right after the hero: find the skill, get the
// practice, do a small amount tonight. Copy lives here so it reads top to
// bottom; BenefitCard only handles the layout.
const cards = [
  {
    eyebrow: "A place to start",
    title: "Find the tricky bit.",
    body: "A wrong answer gives you somewhere to begin. Fawna suggests the skill to practise, so you can choose what comes next.",
    art: <FractionsSheetArt />,
  },
  {
    eyebrow: "A little more clarity",
    title: (
      <>
        Less searching.
        <br />
        More “I get it.”
      </>
    ),
    body: "Turn the tricky bits in their schoolwork into a few focused questions. Less time hunting for worksheets. More time helping it click.",
    art: (
      <Image
        src={collage}
        alt="A pile of maths worksheets: times tables, fractions, and a practice sheet with one answer circled."
        fill
        sizes="(min-width: 1024px) 30vw, 100vw"
        className="object-cover object-[50%_45%]"
      />
    ),
  },
  {
    eyebrow: "A smaller next step",
    title: "Three questions, then stop.",
    body: "One skill at a time, small enough for a school night. Enough to see it click. Not enough to spoil the evening.",
    art: <TonightSlipArt />,
  },
];

export default function BenefitsSection() {
  return (
    <section
      aria-labelledby="benefits-heading"
      className="border-b border-ink/10 bg-linen px-5 pt-[clamp(5.5rem,10vw,9rem)] pb-[clamp(5rem,9vw,8rem)] text-ink sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-x-20 gap-y-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <h2
            id="benefits-heading"
            className="font-display text-[1.9rem] leading-[1.08] font-medium tracking-[-0.015em] text-espresso sm:text-[2.3rem] lg:text-5xl"
          >
            <span className="block">A little help with the</span>{" "}
            <span className="sr-only">tricky bits</span>
            <CrosswordWord words={["tricky", "bits"]} className="mt-[0.4em]" />
          </h2>
          <p className="max-w-[38ch] text-[1.0625rem] leading-[1.6] text-ink/80">
            Start with their completed worksheet. Fawna suggests the skill to
            practise and creates a few focused questions to help you work on it
            together.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 sm:mt-18 lg:mt-24 lg:grid-cols-3 lg:grid-rows-[auto_auto] lg:gap-8 xl:gap-10">
          {cards.map((card) => (
            <BenefitCard key={card.eyebrow} {...card} />
          ))}
        </ol>

        <div className="mt-20 grid items-center gap-6 sm:mt-24 lg:mt-30 lg:grid-cols-[1fr_auto] lg:gap-8">
          <div>
            <p className="font-display text-[1.4rem] font-medium">
              A photo of the worksheet. That’s all it needs.
            </p>
            <p className="mt-1 max-w-[56ch] text-sm text-ink/60">
              The worksheets shown are made up to show the idea, not a real
              child’s work. Fawna suggests the skill. You know your child, so
              you decide.
            </p>
          </div>
          <Link href="/upload" className={`${darkButton} min-h-12 px-7`}>
            Find their next step
          </Link>
        </div>
      </div>
    </section>
  );
}
