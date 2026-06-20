import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SOCIAL_LINKS } from "@/lib/constants";
import { homeSectionLink } from "@/lib/site-home";

export function Footer() {
  return (
    <footer className="bg-cream py-10 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Logo variant="footer" className="mb-4 sm:mb-5" />
        <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-foreground-soft">
          Luxury props for hire and bespoke event styling across Sydney.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 sm:mt-5 sm:gap-6">
          <Link
            href={homeSectionLink("props-hire")}
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
        <p className="mt-6 text-xs font-light tracking-wider text-foreground-soft/70 sm:mt-8">
          © {new Date().getFullYear()} DreamScape Event
        </p>
      </div>
    </footer>
  );
}
