import Link from "next/link";
import { homeSectionLink } from "@/lib/site-home";

export function AnnouncementBanner() {
  return (
    <div className="border-b border-sage/20 bg-sage/90 px-4 py-2.5 text-center backdrop-blur-sm">
      <p className="mx-auto max-w-4xl text-xs font-light leading-relaxed text-black sm:text-sm">
        ✨ DreamScape Events is now live! More props and packages are being added
        daily.{" "}
        <Link
          href={homeSectionLink("contact")}
          className="font-normal underline decoration-black/30 underline-offset-2 transition-colors hover:decoration-black"
        >
          Contact us
        </Link>{" "}
        if you don&apos;t see what you&apos;re looking for. ✨
      </p>
    </div>
  );
}
