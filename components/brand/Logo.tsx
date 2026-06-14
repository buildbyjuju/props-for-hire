import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "large" | "footer" | "header";
};

const variantStyles = {
  header: "h-14 w-auto sm:h-[4.5rem]",
  footer: "mx-auto h-[4.5rem] w-auto sm:h-[5.5rem]",
  large: "h-28 w-auto sm:h-32",
  default: "h-[4.5rem] w-auto",
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
        width={1024}
        height={682}
        className={cn("object-contain", variantStyles[variant])}
        priority={variant === "header"}
        sizes={
          variant === "header"
            ? "280px"
            : variant === "footer"
              ? "320px"
              : "360px"
        }
      />
    </Link>
  );
}
