import Link from "next/link";

function Logo({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

// Shared header used by the static content/SEO pages (brand, city, directory,
// about). The interactive app screens keep their own bespoke headers.
export function PageHeader() {
  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-line px-6 py-3.5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
          <Logo />
        </div>
        <span className="font-display font-bold text-base tracking-tight">Pinpoint</span>
      </Link>
      <Link href="/search" className="text-sm bg-accent hover:bg-accent-hover text-on-accent font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
        Open App
      </Link>
    </header>
  );
}

export function PageFooter() {
  return (
    <footer className="border-t border-line px-6 py-10 mt-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
              <Logo size={8} />
            </div>
            <span className="font-display text-sm font-bold">Pinpoint</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted">
            <Link href="/search" className="hover:text-accent transition-colors">Search</Link>
            <Link href="/directory" className="hover:text-accent transition-colors">Directory</Link>
            <Link href="/guides" className="hover:text-accent transition-colors">Guides</Link>
            <Link href="/about" className="hover:text-accent transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
          </nav>
        </div>
        <p className="text-xs text-faint leading-relaxed max-w-2xl">
          Map data ©{" "}
          <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-accent transition-colors">OpenStreetMap</a>{" "}
          contributors. Results are nearby shops likely to stock a brand or item based on community data — not confirmed
          stock. Always confirm with the shop.
        </p>
      </div>
    </footer>
  );
}
