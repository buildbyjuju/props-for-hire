import { HeroSection } from "@/components/home/HeroSection";
import { PropsSection } from "@/components/home/PropsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { WorkSection } from "@/components/home/WorkSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { QuoteSection } from "@/components/home/QuoteSection";

export function HomePageContent() {
  return (
    <>
      <HeroSection />
      <PropsSection />
      <AboutSection />
      <WorkSection />
      <TestimonialsSection />
      <QuoteSection />
    </>
  );
}
