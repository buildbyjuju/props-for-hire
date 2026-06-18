"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type HorizontalScrollProps = {
  children: ReactNode;
  className?: string;
  listClassName?: string;
};

const DRAG_THRESHOLD_PX = 6;

export function HorizontalScroll({
  children,
  className,
  listClassName,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
    pointerId: -1,
  });
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el || event.pointerType === "touch") return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    const drag = dragRef.current;
    if (!el || !drag.active || event.pointerType === "touch") return;

    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) < DRAG_THRESHOLD_PX) {
      return;
    }

    if (!drag.moved) {
      drag.moved = true;
      setIsDragging(true);
      el.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    el.scrollLeft = drag.scrollLeft - delta;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    const drag = dragRef.current;
    if (!el || event.pointerType === "touch") return;

    if (drag.moved && el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }

    drag.active = false;
    setIsDragging(false);
  }

  function handleClickCapture(event: React.MouseEvent) {
    if (dragRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.moved = false;
    }
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={handleClickCapture}
      className={cn(
        "-mx-4 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-3 scrollbar-none snap-x snap-mandatory touch-pan-x sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:pb-4",
        isDragging && "cursor-grabbing select-none",
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
