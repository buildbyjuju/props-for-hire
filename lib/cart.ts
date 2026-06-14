import { z } from "zod";

export const cartLineSchema = z.object({
  itemId: z.string().min(1),
  itemName: z.string(),
  itemSlug: z.string(),
  categorySlug: z.string(),
  priceCents: z.number().int().positive(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  imageUrl: z.string().optional(),
  selectedSize: z.string().optional(),
  selectedSets: z.string().optional(),
  bondCents: z.number().int().nonnegative().optional(),
  pickupDate: z.string().optional(),
  returnDate: z.string().optional(),
  hireDays: z.number().int().positive().optional(),
});

export const cartSchema = z.array(cartLineSchema);

export type CartLine = z.infer<typeof cartLineSchema>;

export const CART_COOKIE = "dreamscape_cart";

export function cartLineKey(
  line: Pick<CartLine, "itemId" | "eventDate" | "selectedSize" | "selectedSets">,
) {
  return `${line.itemId}|${line.eventDate}|${line.selectedSize ?? ""}|${line.selectedSets ?? ""}`;
}

export function parseCart(raw: string | undefined): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return cartSchema.parse(parsed);
  } catch {
    return [];
  }
}

export function serializeCart(cart: CartLine[]): string {
  return JSON.stringify(cart);
}

export function addToCart(cart: CartLine[], line: CartLine): CartLine[] {
  const key = cartLineKey(line);
  const exists = cart.some((l) => cartLineKey(l) === key);
  if (exists) return cart;
  return [...cart, line];
}

export function removeFromCart(
  cart: CartLine[],
  itemId: string,
  eventDate: string,
  selectedSize?: string,
  selectedSets?: string,
): CartLine[] {
  const key = cartLineKey({ itemId, eventDate, selectedSize, selectedSets });
  return cart.filter((l) => cartLineKey(l) !== key);
}

export function cartTotal(cart: CartLine[]): number {
  return cart.reduce(
    (sum, line) => sum + line.priceCents + (line.bondCents ?? 0),
    0,
  );
}

export function cartHireTotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.priceCents, 0);
}

export function cartBondTotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + (line.bondCents ?? 0), 0);
}
