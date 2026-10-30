import Link from "next/link";
import { headerLink } from "./buttonStyles";

// Floats over the hero artwork, so the page wrapper must be `relative`.
export default function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 text-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
        <Link
          href="/"
          className="rounded-md font-display text-2xl font-semibold tracking-wide focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-cream"
        >
          Fawna
        </Link>

        {/* "Log in" and "How it works" are left out until they exist. */}
        <nav aria-label="Main">
          <Link href="/upload" className={`${headerLink} min-h-11 px-5`}>
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
