import type { Metadata } from "next";
import { HomePageContent } from "@/components/home/HomePageContent";

export const metadata: Metadata = {
  title: "Preview | Dream Scape Moments",
  description: "Private preview of the Dream Scape Moments website.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewPage() {
  return <HomePageContent />;
}
