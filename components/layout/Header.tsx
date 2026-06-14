"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

const navLinks = NAV_LINKS.filter((link) => link.label !== "Contact");

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-xs font-bold uppercase tracking-luxury text-black transition-colors hover:text-warm-white"
    >
      {label}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-cream/20 bg-cream/35 backdrop-blur-lg backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo variant="header" />

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
          <Link
            href="/cart"
            className="relative text-black transition-colors hover:text-warm-white"
            aria-label="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px] stroke-[1.25]" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-warm-white text-[9px] text-black">
                {count}
              </span>
            )}
          </Link>
          <Button size="sm" variant="default" className="font-bold" asChild>
            <Link href="/#contact">Contact</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/cart"
            className="relative text-black"
            aria-label="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px] stroke-[1.25]" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-warm-white text-[9px] text-black">
                {count}
              </span>
            )}
          </Link>
          <Button size="sm" variant="default" className="font-bold" asChild>
            <Link href="/#contact">Contact</Link>
          </Button>
          <button
            type="button"
            className="text-black"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-cream/20 bg-cream/40 backdrop-blur-lg lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col items-center gap-5 px-6 py-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
