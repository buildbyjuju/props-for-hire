"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-light text-foreground",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 h-7 w-7 rounded-full text-foreground-soft hover:bg-cream",
        button_next:
          "absolute right-1 h-7 w-7 rounded-full text-foreground-soft hover:bg-cream",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-foreground-soft/60 w-9 text-[0.75rem] font-light",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button:
          "h-9 w-9 p-0 font-light rounded-full hover:bg-cream",
        selected: "bg-sage text-warm-white hover:bg-sage rounded-full",
        today: "bg-sage-muted text-foreground rounded-full",
        outside: "text-foreground-soft/30",
        disabled: "text-foreground-soft/30",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

export { Calendar };
