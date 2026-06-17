import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getSiteUrl } from "@/lib/stripe";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "DreamScape Event | Luxury Props & Event Styling Sydney",
    template: "%s | DreamScape Event",
  },
  description:
    "Luxury props for hire and bespoke event styling in Sydney. Sage, cream, and timeless celebrations.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "DreamScape Event",
    description: "Luxury event styling and props for hire — Sydney.",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-screen bg-warm-white antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
