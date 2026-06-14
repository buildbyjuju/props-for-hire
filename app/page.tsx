import { HeroSection } from "@/components/home/HeroSection";
import { PropsSection } from "@/components/home/PropsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { WorkSection } from "@/components/home/WorkSection";
import { QuoteSection } from "@/components/home/QuoteSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PropsSection />
      <AboutSection />
      <WorkSection />
      <QuoteSection />
    </>
  );
}
