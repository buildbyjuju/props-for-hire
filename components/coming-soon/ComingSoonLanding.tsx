import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const INSTAGRAM_URL = "https://instagram.com/dreamscape_event.au";
const WHATSAPP_URL = "https://wa.me/61474973317";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[18px] w-[18px]"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SocialIcon({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-sage/25 bg-cream/60 text-foreground-soft transition-all duration-300 hover:border-sage/50 hover:bg-cream hover:text-sage",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function ComingSoonLanding() {
  return (
    <div className="coming-soon-page relative flex min-h-[100dvh] flex-col overflow-hidden bg-[linear-gradient(180deg,#fffdfb_0%,#f8f5f0_48%,#f3efe8_100%)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 75% 45% at 50% 0%, rgba(168,181,162,0.32), transparent 58%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-6 sm:max-w-lg sm:px-8 sm:py-10">
        <div className="coming-soon-fade-up coming-soon-delay-1 w-full text-center">
          <Image
            src="/logo.png"
            alt="Dream Scape Moments"
            width={576}
            height={1024}
            priority
            className="mx-auto h-[min(26vh,200px)] w-auto max-w-[min(64vw,180px)] object-contain sm:h-[min(28vh,240px)] sm:max-w-[220px]"
            sizes="(max-width: 640px) 64vw, 220px"
          />
          <p className="mt-3 text-[10px] uppercase leading-relaxed tracking-[0.16em] text-foreground-soft sm:mt-3.5 sm:text-[11px] sm:tracking-[0.2em]">
            Sydney • Party Props • Event Styling • Balloon Styling
          </p>
        </div>

        <h1 className="coming-soon-fade-up coming-soon-delay-2 mt-5 max-w-sm font-serif text-xl font-light leading-snug text-foreground sm:mt-6 sm:max-w-md sm:text-2xl md:text-3xl">
          ✨ Something Beautiful Is Coming ✨
        </h1>

        <div className="coming-soon-fade-up coming-soon-delay-3 mt-4 max-w-sm space-y-2.5 text-center text-[13px] font-light leading-relaxed text-foreground-soft sm:mt-5 sm:max-w-md sm:space-y-3 sm:text-sm">
          <p>Online bookings are launching soon.</p>
          <p>
            Browse our collection, check availability, and reserve your favourite
            party props in just a few clicks.
          </p>
          <p>
            Until then, we&apos;re taking bookings through Instagram and WhatsApp.
          </p>
        </div>

        <p className="coming-soon-fade-up coming-soon-delay-4 mt-5 text-center text-[10px] uppercase tracking-[0.14em] text-sage sm:mt-6 sm:text-[11px] sm:tracking-[0.18em]">
          Taking bookings now via Instagram &amp; WhatsApp
        </p>

        <div className="coming-soon-fade-up coming-soon-delay-5 mt-4 flex w-full flex-col gap-2.5 sm:mt-5 sm:gap-3">
          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="coming-soon-instagram-btn inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-sage px-5 py-2.5 text-xs font-light tracking-[0.12em] text-black shadow-luxury sm:min-h-12 sm:text-sm sm:tracking-[0.14em]"
          >
            <span aria-hidden>📸</span>
            Follow Us on Instagram
          </Link>

          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sage/40 bg-cream/80 px-5 py-2.5 text-xs font-light tracking-[0.1em] text-foreground transition-all duration-300 hover:border-sage hover:bg-cream sm:min-h-12 sm:text-sm"
          >
            <span aria-hidden>💬</span>
            Book via WhatsApp
          </Link>
        </div>
      </div>

      <footer className="coming-soon-fade-up coming-soon-delay-6 relative z-10 px-5 pb-6 pt-2 text-center sm:pb-8">
        <div className="flex items-center justify-center gap-3.5 sm:gap-4">
          <SocialIcon href={INSTAGRAM_URL} label="Instagram">
            <InstagramIcon />
          </SocialIcon>
          <SocialIcon href={WHATSAPP_URL} label="WhatsApp">
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </SocialIcon>
          {SOCIAL_LINKS.facebook !== "https://facebook.com" ? (
            <SocialIcon href={SOCIAL_LINKS.facebook} label="Facebook">
              <span className="font-serif text-sm leading-none">f</span>
            </SocialIcon>
          ) : null}
          {SOCIAL_LINKS.tiktok !== "https://tiktok.com" ? (
            <SocialIcon href={SOCIAL_LINKS.tiktok} label="TikTok">
              <span className="text-xs font-medium tracking-tight">TT</span>
            </SocialIcon>
          ) : null}
        </div>

        <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-foreground-soft sm:mt-5 sm:text-xs sm:tracking-[0.2em]">
          Launching Soon 🤍
        </p>
      </footer>
    </div>
  );
}
