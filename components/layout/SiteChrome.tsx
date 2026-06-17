"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SplashScreen } from "@/components/layout/SplashScreen";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <SplashScreen />
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "bg-warm-white text-foreground border-sage-muted",
          },
        }}
      />
    </CartProvider>
  );
}
