import type { ReactNode } from "react";

// ── Shared editorial layout primitives ───────────────────────────────────────
// Used across every page so widths, rhythm and section "shape" are consistent —
// the professional backbone under the loud streetwear styling.

const WIDTHS = {
  narrow: "max-w-2xl", // long-form prose (guide articles)
  default: "max-w-5xl", // standard editorial pages
  wide: "max-w-6xl", // landing / big moments
} as const;

export function Container({
  size = "default",
  className = "",
  children,
}: {
  size?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`${WIDTHS[size]} mx-auto px-5 sm:px-6 ${className}`}>{children}</div>;
}

const BANDS = {
  none: "",
  panel: "bg-panel",
  accent: "bg-accent text-on-accent",
  ink: "bg-ink text-white",
} as const;

// A full-bleed horizontal band whose inner content is constrained by Container.
export function Section({
  band = "none",
  size = "default",
  className = "",
  innerClassName = "",
  children,
}: {
  band?: keyof typeof BANDS;
  size?: keyof typeof WIDTHS;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={`${BANDS[band]} ${className}`}>
      <Container size={size} className={innerClassName}>
        {children}
      </Container>
    </section>
  );
}

// Mono uppercase eyebrow. Pass `index` to render a numbered tag like "01 / BRAND".
export function Kicker({
  index,
  className = "",
  children,
}: {
  index?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={`kicker inline-flex items-center gap-2 ${className}`}>
      {index != null && (
        <span className="tabular-nums">{String(index).padStart(2, "0")}</span>
      )}
      {index != null && <span aria-hidden className="opacity-40">/</span>}
      {children}
    </span>
  );
}

// Rotated sticker badge for hero accents.
export function Stamp({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`stamp text-[0.625rem] font-medium border-2 border-ink rounded-full px-2.5 py-1 ${className}`}
    >
      {children}
    </span>
  );
}
