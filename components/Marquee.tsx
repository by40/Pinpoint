// Pure-CSS scrolling ticker (no JS). The track holds the items twice so the
// -50% translate loops seamlessly; it freezes under prefers-reduced-motion.
const DEFAULT_ITEMS = [
  "Find clothes near you",
  "Free",
  "No account",
  "UK shops",
  "Powered by OpenStreetMap",
];

export default function Marquee({
  items = DEFAULT_ITEMS,
  className = "",
}: {
  items?: string[];
  className?: string;
}) {
  const group = (prefix: string) =>
    items.map((it, i) => (
      <span key={prefix + i} className="inline-flex items-center">
        <span className="px-4">{it}</span>
        <span className="opacity-60">✸</span>
      </span>
    ));

  return (
    <div className={`marquee bg-accent text-on-accent ${className}`}>
      <div className="marquee-track py-1.5 text-[0.6875rem] font-mono uppercase tracking-[0.18em]">
        <span className="inline-flex items-center shrink-0" aria-hidden>{group("a")}</span>
        <span className="inline-flex items-center shrink-0" aria-hidden>{group("b")}</span>
      </div>
    </div>
  );
}
