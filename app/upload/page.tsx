import Link from "next/link";
import ImageUpload from "../components/ImageUpload";

// A #FCF3E6 page with the landing page's stamp-edged paper cards on top,
// and pixel details from the PRACTICE letters (ADR-024).
export default function UploadPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#fcf3e6] font-sans text-ink">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
        <Link
          href="/"
          className="rounded-md font-display text-2xl font-semibold tracking-wide focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-espresso"
        >
          Fawna
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md px-1 text-sm font-semibold text-ink/70 underline decoration-ink/25 decoration-2 underline-offset-6 transition-colors hover:text-ink hover:decoration-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-espresso"
        >
          Back to home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8">
        <div className="pt-6 sm:pt-10">
          <p className="text-sm font-semibold tracking-wide text-rust uppercase">
            Pull up a chair
          </p>
          <h1 className="mt-2 font-display text-[clamp(2.25rem,1.5rem+3vw,4rem)] leading-[1.05] font-medium tracking-[-0.015em] text-balance">
            Find their next step
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink/80">
            Show Fawna a finished maths worksheet. Together you’ll see what
            went well, and the exact skill behind each mistake.
          </p>
          <p className="mt-2 text-sm font-semibold text-rust">
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
