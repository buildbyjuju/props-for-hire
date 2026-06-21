import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/stripe";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout/", "/cart", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
