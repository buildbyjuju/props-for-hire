"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HIRE_DISCOUNT_PERCENT } from "@/lib/pricing";

const STORAGE_KEY = "dreamscape-2nd-birthday-dismissed";
const SPLASH_KEY = "dreamscape-splash-seen";
const RETURN_VISIT_DELAY_MS = 1400;
const FIRST_VISIT_DELAY_MS = 2800;

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
      className="celebration-confetti-field pointer-events-none absolute inset-0 overflow-hidden"
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

export function CelebrationModal() {
  const [open, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let openTimer: number | undefined;

    const openModal = () => {
      const delay = sessionStorage.getItem(SPLASH_KEY)
        ? RETURN_VISIT_DELAY_MS
        : FIRST_VISIT_DELAY_MS;

      openTimer = window.setTimeout(() => {
        setOpen(true);
        if (!reducedMotion) {
          setShowConfetti(true);
        }
      }, delay);
    };

    if (sessionStorage.getItem(SPLASH_KEY)) {
      openModal();
      return () => {
        if (openTimer) window.clearTimeout(openTimer);
      };
    }

    const poll = window.setInterval(() => {
      if (sessionStorage.getItem(SPLASH_KEY)) {
        window.clearInterval(poll);
        openModal();
      }
    }, 200);

    const fallback = window.setTimeout(() => {
      window.clearInterval(poll);
      openModal();
    }, 4000);

    return () => {
      window.clearInterval(poll);
      window.clearTimeout(fallback);
      if (openTimer) window.clearTimeout(openTimer);
    };
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      localStorage.setItem(STORAGE_KEY, "1");
      setShowConfetti(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="relative max-w-md overflow-hidden border border-sage/25 text-center">
        {showConfetti ? <CelebrationConfetti /> : null}

        <div className="celebration-modal-enter relative z-10 flex flex-col items-center">
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

          <DialogHeader className="mt-5 items-center text-center">
            <DialogTitle className="text-center text-2xl sm:text-3xl">
              DreamScape Moments is 2!
            </DialogTitle>
            <DialogDescription className="max-w-sm text-center text-sm leading-relaxed">
              Two years of styling beautiful celebrations across Sydney. Thank
              you for being part of our story — here&apos;s to many more
              unforgettable moments.
            </DialogDescription>
          </DialogHeader>

          {HIRE_DISCOUNT_PERCENT > 0 ? (
            <p className="mt-4 rounded-full bg-sage/10 px-4 py-2 text-xs font-light text-foreground">
              🎉 Enjoy {HIRE_DISCOUNT_PERCENT}% off all hire fees as we celebrate
            </p>
          ) : null}

          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button className="min-h-11 w-full sm:w-auto" asChild>
              <Link href="/props">Browse the collection</Link>
            </Button>
            <Button
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => handleOpenChange(false)}
            >
              Continue exploring
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
