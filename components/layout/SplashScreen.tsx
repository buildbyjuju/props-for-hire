"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dreamscape-splash-seen";
const HOLD_MS = 1500;
const OPEN_MS = 1100;

type Phase = "idle" | "hold" | "opening" | "done";

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setPhase("done");
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setPhase("done");
      return;
    }

    setPhase("hold");
    document.body.style.overflow = "hidden";

    const openTimer = window.setTimeout(() => {
      setPhase("opening");
    }, HOLD_MS);

    const doneTimer = window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      document.body.style.overflow = "";
      setPhase("done");
    }, HOLD_MS + OPEN_MS);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "idle" || phase === "done") {
    return null;
  }

  const isOpening = phase === "opening";

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      aria-hidden={isOpening}
    >
      {/* Logo — centred above panels, fades in then out as doors open */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[103] flex items-center justify-center transition-opacity duration-500 ease-out",
          isOpening ? "opacity-0" : "opacity-100",
        )}
        style={{ transitionDuration: isOpening ? "450ms" : undefined }}
      >
        <Image
          src="/logo.png"
          alt="Dream Scape Moments"
          width={576}
          height={1024}
          priority
          className="splash-logo h-[min(68vh,640px)] w-auto max-w-[min(88vw,380px)] min-h-[300px] object-contain sm:min-h-[360px]"
          sizes="(max-width: 768px) 88vw, 380px"
        />
      </div>

      {/* Left door */}
      <div
        className={cn(
          "splash-door-left absolute left-0 top-0 z-[101] h-full w-1/2 bg-cream shadow-[4px_0_24px_rgba(168,181,162,0.08)]",
          isOpening && "splash-door-open-left",
        )}
        aria-hidden
      />

      {/* Right door */}
      <div
        className={cn(
          "splash-door-right absolute right-0 top-0 z-[101] h-full w-1/2 bg-cream shadow-[-4px_0_24px_rgba(168,181,162,0.08)]",
          isOpening && "splash-door-open-right",
        )}
        aria-hidden
      />

      {/* Centre seam — sage accent */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 z-[102] h-full w-px -translate-x-1/2 bg-sage/25 transition-opacity duration-300",
          isOpening ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
      />
    </div>
  );
}
