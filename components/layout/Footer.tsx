import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="section-padding bg-cream">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Logo variant="footer" className="mb-6 sm:mb-8" />
        <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-foreground-soft">
          Luxury props for hire and bespoke event styling across Sydney.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-5 sm:mt-8 sm:gap-8">
          <Link
            href="/#props-hire"
            className="text-xs uppercase tracking-luxury text-foreground-soft hover:text-sage"
          >
            Props for Hire
          </Link>
          <a
            href={SOCIAL_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-luxury text-foreground-soft hover:text-sage"
          >
            Contact
          </a>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-luxury text-foreground-soft hover:text-sage"
          >
            Instagram
          </a>
        </div>
        <p className="mt-12 text-xs font-light tracking-wider text-foreground-soft/70">
          © {new Date().getFullYear()} DreamScape Event
        </p>
      </div>
    </footer>
  );
}
