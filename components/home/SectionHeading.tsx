import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "center",
  blackText = false,
  compact = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "center" | "left";
  blackText?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-none text-left",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "font-bold uppercase tracking-luxury",
            compact
              ? "mb-1.5 text-[10px] sm:mb-2 sm:text-xs lg:mb-4 lg:text-xs"
              : "mb-4 text-xs",
            blackText ? "text-black" : "text-sage",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-serif font-light lg:text-[2.75rem] lg:leading-snug",
          compact
            ? "text-lg leading-tight sm:text-xl md:text-2xl"
            : "text-2xl leading-tight sm:text-3xl sm:leading-snug",
          blackText ? "text-black" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "font-light leading-relaxed",
            compact
              ? "mt-1.5 text-[11px] leading-snug sm:mt-2 sm:text-xs md:text-sm lg:mt-6 lg:text-base lg:leading-relaxed"
              : "mt-4 text-sm sm:mt-6 sm:text-base",
            blackText ? "text-black" : "text-foreground-soft",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
