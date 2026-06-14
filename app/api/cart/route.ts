import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CART_COOKIE,
  parseCart,
  serializeCart,
  cartSchema,
} from "@/lib/cart";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  const cart = parseCart(raw);
  return NextResponse.json({ cart });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = cartSchema.safeParse(body.cart);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const response = NextResponse.json({ cart: parsed.data });
  response.cookies.set(CART_COOKIE, serializeCart(parsed.data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
