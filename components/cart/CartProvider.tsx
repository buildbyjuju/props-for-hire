"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  type CartLine,
  addToCart as mergeCart,
  removeFromCart,
  cartTotal,
} from "@/lib/cart";

type CartContextValue = {
  cart: CartLine[];
  addLine: (line: CartLine) => void;
  removeLine: (
    itemId: string,
    eventDate: string,
    selectedSize?: string,
    selectedSets?: string,
  ) => void;
  clearCart: () => void;
  totalCents: number;
  count: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data: { cart: CartLine[] }) => setCart(data.cart ?? []))
      .catch(() => setCart([]))
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (next: CartLine[]) => {
    setCart(next);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: next }),
    });
  }, []);

  const addLine = useCallback(
    (line: CartLine) => {
      const next = mergeCart(cart, line);
      void persist(next);
      toast.success("Added to selection");
    },
    [cart, persist],
  );

  const removeLine = useCallback(
    (
      itemId: string,
      eventDate: string,
      selectedSize?: string,
      selectedSets?: string,
    ) => {
      const next = removeFromCart(
        cart,
        itemId,
        eventDate,
        selectedSize,
        selectedSets,
      );
      void persist(next);
      toast.success("Removed from selection");
    },
    [cart, persist],
  );

  const clearCart = useCallback(() => {
    void persist([]);
  }, [persist]);

  const value = useMemo(
    () => ({
      cart,
      addLine,
      removeLine,
      clearCart,
      totalCents: cartTotal(cart),
      count: cart.length,
      isLoading,
    }),
    [cart, addLine, removeLine, clearCart, isLoading],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
