export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "center",
  blackText = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "center" | "left";
  blackText?: boolean;
}) {
  return (
    <div
      id={id}
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-xl text-left"
      }
    >
      {eyebrow && (
        <p
          className={`mb-4 text-xs font-bold uppercase tracking-luxury ${
            blackText ? "text-black" : "text-sage"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-serif text-3xl font-light sm:text-4xl lg:text-[2.75rem] ${
          blackText ? "text-black" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-6 text-base font-light leading-relaxed ${
            blackText ? "text-black" : "text-foreground-soft"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
