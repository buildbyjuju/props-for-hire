import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

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
            "h-3 w-3 sm:h-4 sm:w-4",
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
  className,
  compact = false,
}: (typeof testimonials)[number] & {
  className?: string;
  compact?: boolean;
}) {
  const initial = name.charAt(0);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl bg-sage shadow-luxury",
        compact ? "p-3 sm:p-4" : "w-[300px] shrink-0 p-5 sm:w-[340px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-white/20 text-xs font-semibold text-warm-white sm:h-10 sm:w-10 sm:text-sm">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-warm-white sm:text-sm">
              {name}
            </p>
            <p className="text-[10px] text-warm-white/70 sm:text-xs">{date}</p>
          </div>
        </div>
        <GoogleIcon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
      </div>

      <StarRating rating={rating} />

      <p
        className={cn(
          "mt-2 flex-1 leading-relaxed text-warm-white/90",
          compact ? "text-[11px] leading-snug sm:text-xs" : "mt-3 text-sm",
        )}
      >
        {quote}
      </p>

      <p className={cn("text-warm-white/60", compact ? "mt-2 text-[10px]" : "mt-4 text-xs")}>
        {event}
      </p>
    </article>
  );
}

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="max-[340px]:flex max-[340px]:flex-col grid grid-cols-[minmax(0,1fr)_42%] items-start gap-3 sm:gap-4 lg:block">
          <SectionHeading
            eyebrow="Reviews"
            title="What our clients say"
            compact
            align="left"
            className="lg:mx-auto lg:max-w-2xl lg:text-center"
          />
          <div className="lg:hidden">
            <GoogleReviewCard {...testimonials[0]} compact className="w-full" />
          </div>
        </div>

        <ul className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 lg:hidden">
          {testimonials.slice(1).map((t) => (
            <li key={t.name}>
              <GoogleReviewCard {...t} compact className="w-full" />
            </li>
          ))}
        </ul>

        <div className="-mx-3 mt-10 hidden overflow-x-auto px-3 pb-4 scrollbar-none sm:-mx-4 sm:px-4 lg:mx-0 lg:block lg:px-0">
          <ul className="flex w-max gap-5 sm:gap-6">
            {testimonials.map((t) => (
              <li key={t.name}>
                <GoogleReviewCard {...t} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
