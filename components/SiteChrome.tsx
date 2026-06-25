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
    <header className="sticky top-0 z-50 bg-[#F7F6F3]/95 backdrop-blur-sm border-b border-[#E3E1DB] px-6 py-3.5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#141412] flex items-center justify-center">
          <Logo />
        </div>
        <span className="font-semibold text-sm">Pinpoint</span>
      </Link>
      <Link href="/search" className="text-sm bg-[#141412] hover:bg-[#2A2A28] text-white font-medium px-4 py-2 rounded-lg transition-colors">
        Open App
      </Link>
    </header>
  );
}

export function PageFooter() {
  return (
    <footer className="border-t border-[#E3E1DB] px-6 py-10 mt-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#141412] flex items-center justify-center">
              <Logo size={8} />
            </div>
            <span className="text-sm font-semibold">Pinpoint</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#57554E]">
            <Link href="/search" className="hover:text-[#141412] transition-colors">Search</Link>
            <Link href="/directory" className="hover:text-[#141412] transition-colors">Directory</Link>
            <Link href="/guides" className="hover:text-[#141412] transition-colors">Guides</Link>
            <Link href="/about" className="hover:text-[#141412] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[#141412] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#141412] transition-colors">Terms</Link>
          </nav>
        </div>
        <p className="text-xs text-[#6B6A63] leading-relaxed max-w-2xl">
          Map data ©{" "}
          <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#141412] transition-colors">OpenStreetMap</a>{" "}
          contributors. Results are nearby shops likely to stock a brand or item based on community data — not confirmed
          stock. Always confirm with the shop.
        </p>
      </div>
    </footer>
  );
}
