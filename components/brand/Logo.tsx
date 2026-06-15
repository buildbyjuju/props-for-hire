import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "large" | "footer" | "header";
};

const variantStyles = {
  header: "h-[4.5rem] w-auto sm:h-20 md:h-24 lg:h-32",
  footer: "mx-auto h-24 w-auto sm:h-28 lg:h-36",
  large: "h-36 w-auto sm:h-40",
  default: "h-24 w-auto sm:h-28",
} as const;

export function Logo({ className, variant = "default" }: LogoProps) {
  return (
    <Link
      href="/"
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
