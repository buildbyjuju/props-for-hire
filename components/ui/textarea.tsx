import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[120px] w-full rounded-2xl border-0 bg-warm-white px-4 py-3 text-sm font-light text-foreground shadow-[inset_0_0_0_1px_rgba(168,181,162,0.25)] placeholder:text-foreground-soft/60 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_1px_rgba(168,181,162,0.6)]",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
