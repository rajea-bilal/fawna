import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Nunito, Patrick_Hand } from "next/font/google";
import "./globals.css";

// Body text (400), crossword tiles (500), navigation and buttons (600),
// card eyebrows (700).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headings. A variable font, so no weight list. `opsz` lets the browser
// pick the display cut at headline sizes.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Handwriting inside the benefits illustrations only: a child's answers,
// worksheet labels. Never used for interface text.
const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: "400",
});

const description =
  "Upload your child’s completed worksheet. Fawna helps you find where they need support and creates focused practice for their next step.";

export const metadata: Metadata = {
  // Lets link previews turn relative paths into full URLs on our domain.
  metadataBase: new URL("https://www.getfawna.com"),
  title: "Fawna Learning",
  description,
  // What link previews show (LinkedIn, Slack, email).
  openGraph: {
    title: "Fawna Learning",
    description,
    url: "/",
    siteName: "Fawna",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} ${geistMono.variable} ${patrickHand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
