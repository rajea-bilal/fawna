import Link from "next/link";
import ImageUpload from "../components/ImageUpload";

// A light, editorial page (issue #18): one font, thin rules, white stamp-edged
// cards, and the same soft colours as the results below the form.
export default function UploadPage() {
  return (
    <div className="flex flex-1 flex-col bg-canvas font-ui text-charcoal">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-charcoal/16 py-4 sm:py-5">
          <Link
            href="/"
            className="rounded-md font-display text-2xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal"
          >
            Fawna
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md px-1 text-sm font-semibold text-dusk underline decoration-charcoal/25 underline-offset-4 transition-colors hover:text-charcoal hover:decoration-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            Back to home
          </Link>
        </header>
      </div>

      <main className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8">
        <div className="pt-10 sm:pt-14">
          <p className="text-xs font-semibold tracking-[0.13em] text-dusk uppercase">
            Pull up a chair
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance">
            Find their next step
          </h1>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-dusk">
            Show Fawna a finished maths worksheet. Together you’ll see what
            went well, and the exact skill behind each mistake.
          </p>
          <p className="mt-2 text-sm text-dusk">
            Maths today. English vocabulary, synonyms and antonyms next.
          </p>
        </div>

        <div className="mt-12">
          <ImageUpload />
        </div>
      </main>
    </div>
  );
}
