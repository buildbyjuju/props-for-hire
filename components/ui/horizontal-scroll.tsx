import { cn } from "@/lib/utils";

type HorizontalScrollProps = {
  children: React.ReactNode;
  className?: string;
  listClassName?: string;
};

export function HorizontalScroll({
  children,
  className,
  listClassName,
}: HorizontalScrollProps) {
  return (
    <div
      className={cn(
        "-mx-4 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-3 scrollbar-none snap-x snap-mandatory sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-4",
        className,
      )}
    >
      <ul
        className={cn(
          "flex w-max snap-x snap-mandatory gap-4 sm:gap-5 lg:gap-6",
          listClassName,
        )}
      >
        {children}
      </ul>
    </div>
  );
}
