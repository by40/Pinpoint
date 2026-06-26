import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-ink px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>
      <p className="kicker text-accent mb-3">Error 404</p>
      <h1 className="font-display font-bold uppercase tracking-[-0.02em] leading-[0.9] text-[clamp(2.5rem,9vw,5rem)] mb-3">Page not found</h1>
      <p className="text-sm text-muted max-w-sm leading-relaxed mb-8">
        We couldn&apos;t pinpoint that page. It may have moved, or the link might be incomplete.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="bg-accent hover:bg-accent-hover text-on-accent font-bold uppercase tracking-wide px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Back home
        </Link>
        <Link
          href="/search"
          className="bg-surface hover:bg-panel text-ink border-2 border-ink font-bold uppercase tracking-wide px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Start searching
        </Link>
      </div>
    </div>
  );
}
