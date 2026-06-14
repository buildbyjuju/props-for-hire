import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";

const testimonials = [
  {
    quote:
      "Every detail felt intentional — soft, romantic, and so far from anything we had seen before.",
    name: "Sarah M.",
    event: "Bridal shower",
    rating: 5,
    date: "2 months ago",
  },
  {
    quote:
      "DreamScape understood our vision immediately. The room felt like a boutique editorial.",
    name: "Layla K.",
    event: "Zafeh",
    rating: 5,
    date: "4 months ago",
  },
  {
    quote:
      "Hiring online was seamless, and the setup on the day was flawless. Pure calm luxury.",
    name: "Emma T.",
    event: "Baby shower",
    rating: 5,
    date: "1 month ago",
  },
  {
    quote:
      "The props were stunning and the team was so professional. Our guests couldn't stop taking photos.",
    name: "Michelle R.",
    event: "Birthday",
    rating: 5,
    date: "3 months ago",
  },
  {
    quote:
      "Absolutely beautiful setup from start to finish. Would recommend DreamScape to anyone.",
    name: "Priya S.",
    event: "Engagement",
    rating: 5,
    date: "5 months ago",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-[#FBBC04] text-[#FBBC04]"
              : "fill-none text-warm-white/30",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GoogleReviewCard({
  quote,
  name,
  event,
  rating,
  date,
}: (typeof testimonials)[number]) {
  const initial = name.charAt(0);

  return (
    <article className="flex h-full w-[280px] shrink-0 snap-start flex-col rounded-2xl bg-sage p-5 shadow-luxury sm:w-[300px] md:w-[340px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm-white/20 text-sm font-semibold text-warm-white">
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-warm-white">{name}</p>
            <p className="text-xs text-warm-white/70">{date}</p>
          </div>
        </div>
        <GoogleIcon className="h-5 w-5 shrink-0" />
      </div>

      <StarRating rating={rating} />

      <p className="mt-3 flex-1 text-sm leading-relaxed text-warm-white/90">
        {quote}
      </p>

      <p className="mt-4 text-xs text-warm-white/60">{event}</p>
    </article>
  );
}

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Reviews" title="What our clients say" />

        <HorizontalScroll className="mt-8 lg:mt-10">
          {testimonials.map((t) => (
            <li key={t.name}>
              <GoogleReviewCard {...t} />
            </li>
          ))}
        </HorizontalScroll>

        <p className="mt-3 text-center text-xs font-light text-foreground-soft lg:hidden">
          Swipe to read more reviews
        </p>
      </div>
    </section>
  );
}
