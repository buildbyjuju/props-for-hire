import type { Metadata } from "next";
import { HomePageContent } from "@/components/home/HomePageContent";

export const metadata: Metadata = {
  title: "DreamScape Event | Luxury Props & Event Styling Sydney",
  description:
    "Luxury props for hire and bespoke event styling in Sydney. Browse our collections and book online.",
  openGraph: {
    title: "DreamScape Event",
    description: "Luxury event styling and props for hire — Sydney.",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
