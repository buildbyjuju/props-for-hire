import Image from "next/image";
import Link from "next/link";
import { FULL_SITE_HOME } from "@/lib/site-home";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "large" | "footer" | "header";
  href?: string;
};

const variantStyles = {
  header: "h-11 w-auto sm:h-20 md:h-24 lg:h-32",
  footer: "mx-auto h-32 w-auto sm:h-36 md:h-40",
  large: "h-36 w-auto sm:h-40",
  default: "h-24 w-auto sm:h-28",
} as const;

export function Logo({ className, variant = "default", href = FULL_SITE_HOME }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-block shrink-0 transition-opacity hover:opacity-85",
        variant === "footer" && "block",
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt="Dream Scape Moments"
        width={576}
        height={1024}
        className={cn("object-contain", variantStyles[variant])}
        priority={variant === "header"}
        sizes={
          variant === "header"
            ? "400px"
            : variant === "footer"
              ? "440px"
              : "480px"
        }
      />
    </Link>
  );
}
