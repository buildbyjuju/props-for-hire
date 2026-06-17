import type { Metadata } from "next";
import { ComingSoonLanding } from "@/components/coming-soon/ComingSoonLanding";

export const metadata: Metadata = {
  title: "Coming Soon | Dream Scape Moments",
  description:
    "Something exciting is coming. Soon you'll be able to hire party props online — until then, book via Instagram and WhatsApp.",
  openGraph: {
    title: "Dream Scape Moments — Coming Soon",
    description: "Luxury party props and event styling — launching soon.",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function HomePage() {
  return <ComingSoonLanding />;
}
