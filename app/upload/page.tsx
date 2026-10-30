import Link from "next/link";
import ImageUpload from "../components/ImageUpload";

export default function UploadPage() {
  return (
    <div className="flex flex-1 flex-col bg-page font-sans text-ink">
      <header className="mx-auto w-full max-w-4xl px-5 py-5 sm:px-8 sm:py-6">
        <Link
          href="/"
          className="rounded-md font-display text-2xl font-semibold tracking-wide focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-espresso"
        >
          Fawna
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 pb-16 sm:px-8">
        <h1 className="font-display text-[clamp(2rem,1.5rem+2vw,3rem)] leading-tight font-medium">
          Find their next step
        </h1>
        <p className="mt-3 max-w-[52ch] text-lg text-ink/80">
          Fawna marks a completed maths worksheet and names the exact skill
          behind each mistake.
        </p>
        <p className="mt-2 text-sm font-semibold text-rust">
          Maths today. English vocabulary, synonyms and antonyms next.
        </p>

        <div className="mt-10">
          <ImageUpload />
        </div>
      </main>
    </div>
  );
}
