import FuelDashboard from "@/components/home/fuel-dashboard";
import HeroSection from "@/components/home/hero-section";
import HighlightsSection from "@/components/home/highlights-section";
import RevealSections from "@/components/home/reveal-sections";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />
      <main>
        <RevealSections />
        <FuelDashboard />
        <HeroSection />
        <HighlightsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
