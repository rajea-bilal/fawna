import SiteHeader from "./components/landing/SiteHeader";
import Hero from "./components/landing/Hero";
import BenefitsSection from "./components/landing/benefits/BenefitsSection";
import PracticeSection from "./components/landing/PracticeSection";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col bg-page font-sans text-ink">
      <SiteHeader />
      <main>
        <Hero />
        <BenefitsSection />
        <PracticeSection />
      </main>
    </div>
  );
}
