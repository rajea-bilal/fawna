import Image from "next/image";
import Link from "next/link";
import kitchen from "@/public/images/hero_image_fawna.png";
import { primaryButton } from "./buttonStyles";
import ExamplePreview from "./ExamplePreview";

// The hero fills the first screen. Three layers, back to front: the
// kitchen illustration, an espresso veil for readability, then the copy.
// On phones the picture is cropped to the family and the copy sits at the
// bottom over a rising shadow. On large screens the copy sits mid-left on
// the empty wall and the shadow falls from that side (see `hero-veil`).
export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-svh flex-col bg-espresso text-cream"
    >
      {/* Decorative: the copy explains the product; the scene sets the mood. */}
      <Image
        src={kitchen}
        alt=""
        fill
        sizes="100vw"
        preload
        className="-z-20 object-cover object-[70%_50%] lg:object-center"
      />
      <div aria-hidden className="hero-veil pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pt-28 pb-14 sm:px-8 sm:pb-16 lg:justify-center lg:pb-20">
        <div className="max-w-[34rem]">
          <h1
            id="hero-heading"
            className="font-display text-[clamp(2.5rem,1.25rem+3.6vw,5rem)] leading-[1.02] font-medium tracking-[-0.015em] text-balance"
          >
            You want to help. Where do you start?
          </h1>

          <p className="mt-5 max-w-[42ch] text-base leading-normal text-cream/85 sm:mt-6 sm:text-lg lg:text-xl">
            Upload your child’s completed worksheet. Fawna helps you find where
            they need support and creates focused practice for their next step.
          </p>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
            <Link href="/upload" className={`${primaryButton} min-h-12 px-7`}>
              Find their next step
            </Link>
            <ExamplePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
