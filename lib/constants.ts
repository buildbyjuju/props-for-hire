export const SITE_NAME = "DreamScape Event";

export const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#props-hire", label: "Props for Hire" },
  { href: "/#about", label: "About Us" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact" },
] as const;

/** Luxury collection categories — used on hire page and home preview */
export const CATEGORIES = [
  {
    slug: "backdrops",
    name: "Backdrops",
    description: "Sculptural arches and panels for unforgettable photo moments.",
    image: "/props/backdrops/backdrops-showcase.png",
  },
  {
    slug: "cake-plinth-and-stands",
    name: "Cake Plinth & Stands",
    description: "Elegant plinths and display stands to showcase cakes and styling details.",
    image: "/props/plinths/white-ribbed-plinth.jpg",
  },
  {
    slug: "table-and-buffet",
    name: "Table & Buffet",
    description: "Refined tablescapes and buffet styling for dining and dessert displays.",
    image: "/props/raisers/white-raisers.jpg",
  },
  {
    slug: "neon-signs",
    name: "Neon Signs",
    description: "Soft-glow script pieces for romantic, modern celebrations.",
    image: "/props/neon/light-number.jpg",
  },
  {
    slug: "cutouts",
    name: "Cutouts",
    description: "Life-size character cutouts for playful photo moments and themed parties.",
    image: "/props/cutouts/elsa.jpg",
  },
  {
    slug: "event-furniture-and-marquees",
    name: "Event Furniture & Marquees",
    description: "Premium furniture and marquee hire for outdoor celebrations and styled event spaces.",
    image: "/props/marquees/marqees.jpeg",
  },
] as const;

export const EVENT_TYPES = [
  "Birthday",
  "Bridal shower",
  "Baby shower",
  "Zafeh",
  "Wedding",
  "Other",
] as const;

export const SOCIAL_LINKS = {
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
    "https://instagram.com/dreamscape_event.au",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://tiktok.com",
  whatsapp: "https://wa.me/61474973317",
};

export const FULFILLMENT_OPTIONS = [
  { id: "pickup_bexley", label: "Pick up Bexley" },
  { id: "delivery", label: "Delivery" },
] as const;

export type FulfillmentMethod = (typeof FULFILLMENT_OPTIONS)[number]["id"];

export const PICKUP_BEXLEY_NOTICE =
  "You will receive an email with pickup address, time, and return details after your booking is confirmed.";

export const PICKUP_ADDRESS = "32 Broadford Street, Bexley NSW 2207";

export const RETURN_POLICY =
  "All items must be returned clean and in good condition, with no damage, and in original packaging where applicable.";

export const BOND_REFUND_NOTICE =
  "Refundable bonds are returned after your items are returned and inspected. Late drop-off or damage may affect your bond refund.";

export const DELIVERY_WINDOW_NOTICE =
  "Delivery will be between 10 AM and 1 PM on your pickup day.";

export const DELIVERY_LEAVE_AT_DOOR_LABEL =
  "Leave at door if no one is available";
