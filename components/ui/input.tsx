import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border-0 bg-warm-white px-4 py-2 text-sm font-light text-foreground shadow-[inset_0_0_0_1px_rgba(168,181,162,0.25)] placeholder:text-foreground-soft/60 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_1px_rgba(168,181,162,0.6)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
