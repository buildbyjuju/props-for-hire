import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const INSTAGRAM_URL = "https://instagram.com/dreamscape_event.au";
const WHATSAPP_URL = "https://wa.me/61474973317";
const WHATSAPP_DISPLAY = "0474 973 317";

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
        "flex h-11 w-11 items-center justify-center rounded-full border border-sage/25 bg-cream/60 text-foreground-soft transition-all duration-300 hover:border-sage/50 hover:bg-cream hover:text-sage",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function ComingSoonLanding() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#fffdfb_0%,#f8f5f0_45%,#f3efe8_100%)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(168,181,162,0.35), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-14 sm:px-8 sm:py-20">
        <div className="coming-soon-fade-up coming-soon-delay-1 mx-auto w-full max-w-md text-center">
          <Image
            src="/logo.png"
            alt="Dream Scape Moments"
            width={576}
            height={1024}
            priority
            className="mx-auto h-[min(42vh,320px)] w-auto max-w-[min(72vw,240px)] object-contain sm:h-[min(38vh,360px)] sm:max-w-[280px]"
            sizes="(max-width: 640px) 72vw, 280px"
          />
        </div>

        <h1 className="coming-soon-fade-up coming-soon-delay-2 mt-8 max-w-lg font-serif text-2xl font-light leading-snug text-foreground sm:mt-10 sm:text-3xl md:text-4xl">
          ✨ Something Exciting Is Coming ✨
        </h1>

        <p className="coming-soon-fade-up coming-soon-delay-3 mt-5 max-w-md text-sm font-light leading-relaxed text-foreground-soft sm:mt-6 sm:text-base">
          Soon you&apos;ll be able to hire your party props online, check availability,
          and plan your special event with ease.
        </p>

        <p className="coming-soon-fade-up coming-soon-delay-4 mt-4 max-w-md text-sm font-light leading-relaxed text-foreground-soft sm:text-base">
          Until then, we&apos;re still taking bookings through Instagram and WhatsApp.
        </p>

        <div className="coming-soon-fade-up coming-soon-delay-5 mt-10 flex w-full max-w-sm flex-col gap-3 sm:mt-12 sm:max-w-md sm:gap-4">
          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sage px-6 py-3 text-sm font-light tracking-[0.1em] text-black shadow-luxury transition-all duration-300 hover:bg-sage-light hover:shadow-luxury-hover"
          >
            <span aria-hidden>📸</span>
            Follow Us on Instagram
          </Link>

          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-full border border-sage/40 bg-cream/80 px-6 py-3 text-sm font-light tracking-[0.08em] text-foreground transition-all duration-300 hover:border-sage hover:bg-cream"
          >
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>💬</span>
              Book via WhatsApp
            </span>
            <span className="text-xs tracking-wider text-foreground-soft">
              {WHATSAPP_DISPLAY}
            </span>
          </Link>
        </div>
      </div>

      <footer className="coming-soon-fade-up coming-soon-delay-6 relative z-10 px-5 pb-10 pt-4 text-center sm:pb-14">
        <div className="flex items-center justify-center gap-4 sm:gap-5">
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

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-foreground-soft sm:mt-8">
          Launching Soon 🤍
        </p>
      </footer>
    </div>
  );
}
