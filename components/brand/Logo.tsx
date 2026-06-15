import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "large" | "footer" | "header";
};

const variantStyles = {
  header: "h-14 w-auto sm:h-16 md:h-[4.5rem] lg:h-24",
  footer: "mx-auto h-20 w-auto sm:h-24 lg:h-28",
  large: "h-32 w-auto sm:h-36",
  default: "h-20 w-auto sm:h-24",
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
        alt="DreamScape Event"
        width={576}
        height={1024}
        className={cn("object-contain", variantStyles[variant])}
        priority={variant === "header"}
        sizes={
          variant === "header"
            ? "320px"
            : variant === "footer"
              ? "360px"
              : "400px"
        }
      />
    </Link>
  );
}
