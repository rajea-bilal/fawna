// Shared landing-page links. Most sit on the dark hero artwork;
// `darkButton` is for light sections.
// Height and padding are added where each one is used.

// The one bright action on the page. Cream on the espresso shadow.
export const primaryButton =
  "inline-flex items-center justify-center rounded-lg bg-cream text-base font-semibold text-espresso shadow-lg shadow-espresso/40 transition-colors hover:bg-linen active:translate-y-px focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cream";

// Header action. Outlined and quiet so it does not compete with the hero button.
export const headerLink =
  "inline-flex items-center justify-center rounded-full border border-cream/40 text-base font-semibold text-cream transition-colors hover:bg-cream/10 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cream";

// Quiet links and buttons on the dark hero.
export const quietLink =
  "inline-flex min-h-11 items-center rounded-md px-1 text-base font-semibold text-cream underline decoration-cream/45 decoration-2 underline-offset-6 transition-colors hover:decoration-cream focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cream";

// The main action on light sections. Espresso on linen, the hero button inverted.
export const darkButton =
  "inline-flex items-center justify-center rounded-lg bg-espresso text-base font-semibold text-cream transition-colors hover:bg-ink active:translate-y-px focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-espresso";
