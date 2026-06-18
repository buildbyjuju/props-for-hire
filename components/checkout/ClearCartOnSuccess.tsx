"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function ClearCartOnSuccess({ enabled }: { enabled: boolean }) {
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!enabled || cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [enabled, clearCart]);

  return null;
}
