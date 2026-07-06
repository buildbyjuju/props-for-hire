"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HIRE_DISCOUNT_PERCENT } from "@/lib/pricing";

const STORAGE_KEY = "dreamscape-turns-2-dismissed-v3";
const SPLASH_KEY = "dreamscape-splash-seen";
const POST_SPLASH_DELAY_MS = 700;
const SPLASH_MAX_WAIT_MS = 4500;

const CONFETTI_PIECES = [
  { left: "8%", delay: "0s", duration: "4.2s", color: "#a8b5a2", size: 8 },
  { left: "18%", delay: "0.4s", duration: "3.8s", color: "#c5cfc0", size: 6 },
  { left: "28%", delay: "0.8s", duration: "4.5s", color: "#f8f5f0", size: 7 },
  { left: "38%", delay: "0.2s", duration: "3.6s", color: "#dce3d8", size: 9 },
  { left: "48%", delay: "1s", duration: "4.1s", color: "#a8b5a2", size: 6 },
  { left: "58%", delay: "0.6s", duration: "3.9s", color: "#fffdfb", size: 8 },
  { left: "68%", delay: "0.3s", duration: "4.4s", color: "#c5cfc0", size: 7 },
  { left: "78%", delay: "0.9s", duration: "3.7s", color: "#a8b5a2", size: 6 },
  { left: "88%", delay: "0.5s", duration: "4.3s", color: "#dce3d8", size: 8 },
  { left: "14%", delay: "1.1s", duration: "4s", color: "#fffdfb", size: 5 },
  { left: "52%", delay: "1.3s", duration: "3.5s", color: "#c5cfc0", size: 5 },
  { left: "72%", delay: "1.5s", duration: "4.6s", color: "#f8f5f0", size: 6 },
] as const;

function CelebrationConfetti() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {CONFETTI_PIECES.map((piece, index) => (
        <span
          key={index}
          className="celebration-confetti-piece absolute top-0 rounded-sm"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 1.4,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  );
}

async function waitForSplashToFinish() {
  const start = Date.now();

  while (Date.now() - start < SPLASH_MAX_WAIT_MS) {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      return;
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 100);
    });
  }
}

export function CelebrationModal() {
  const [open, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasScheduled = useRef(false);

  useEffect(() => {
    if (hasScheduled.current || localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    hasScheduled.current = true;
    let cancelled = false;
    let openTimer: number | undefined;

    void waitForSplashToFinish().then(() => {
      if (cancelled || localStorage.getItem(STORAGE_KEY)) {
        return;
      }

      openTimer = window.setTimeout(() => {
        if (cancelled || localStorage.getItem(STORAGE_KEY)) {
          return;
        }

        setOpen(true);
        document.body.style.overflow = "hidden";

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setShowConfetti(true);
        }
      }, POST_SPLASH_DELAY_MS);
    });

    return () => {
      cancelled = true;
      if (openTimer) {
        window.clearTimeout(openTimer);
      }
      document.body.style.overflow = "";
    };
  }, []);

  function close() {
    setOpen(false);
    setShowConfetti(false);
    document.body.style.overflow = "";
    localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      aria-describedby="celebration-description"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
        aria-label="Close celebration message"
        onClick={close}
      />

      <div className="celebration-modal-panel relative z-[201] w-full max-w-md overflow-hidden rounded-3xl border border-sage/25 bg-warm-white p-6 text-center shadow-luxury sm:p-8">
        {showConfetti ? <CelebrationConfetti /> : null}

        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 z-20 text-foreground-soft transition hover:text-sage sm:right-6 sm:top-6"
          aria-label="Close"
        >
          <X className="h-4 w-4 stroke-[1.25]" />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs uppercase tracking-luxury text-sage">
            ✨ Celebrating ✨
          </p>

          <div className="relative mt-4 flex h-28 w-28 items-center justify-center">
            <span
              className="absolute inset-0 rounded-full bg-sage/15"
              aria-hidden
            />
            <span
              className="absolute inset-2 rounded-full border border-sage/30"
              aria-hidden
            />
            <span className="font-serif text-7xl font-light leading-none text-sage">
              2
            </span>
          </div>

          <h2
            id="celebration-title"
            className="mt-5 font-serif text-2xl font-light text-foreground sm:text-3xl"
          >
            DreamScape Moments is 2!
          </h2>
          <p
            id="celebration-description"
            className="mt-3 max-w-sm text-sm font-light leading-relaxed text-foreground-soft"
          >
            Two years of styling beautiful celebrations across Sydney. Thank you
            for being part of our story — here&apos;s to many more unforgettable
            moments.
          </p>

          {HIRE_DISCOUNT_PERCENT > 0 ? (
            <p className="mt-4 rounded-full bg-sage/10 px-4 py-2 text-xs font-light text-foreground">
              🎉 Enjoy {HIRE_DISCOUNT_PERCENT}% off all hire fees as we celebrate
            </p>
          ) : null}

          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button className="min-h-11 w-full sm:w-auto" asChild>
              <Link href="/props" onClick={close}>
                Browse the collection
              </Link>
            </Button>
            <Button
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={close}
            >
              Continue exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
