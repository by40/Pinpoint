import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pinpointapp.uk";

const APP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pinpoint",
  url: SITE_URL,
  applicationCategory: "ShoppingApplication",
  operatingSystem: "Web",
  description:
    "Search a clothing item or brand and instantly see nearby shops likely to sell it, mapped in 3D. Powered by OpenStreetMap.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  browserRequirements: "Requires JavaScript and location access.",
};

const CHIPS = ["Nike trainers", "vintage Levi's", "North Face jacket", "Adidas Sambas", "Dr. Martens"];

const FEATURES = [
  {
    label: "Brand search",
    title: "Looking for a brand? We know where it lives.",
    desc: "Type a brand — \"Nike\", \"Levi's\", \"The North Face\" — and we surface the brand's own stores plus the nearby shops and retailers that carry it.",
    link: null,
  },
  {
    label: "Item search",
    title: "Or just say what you're after.",
    desc: "\"Trainers\", \"vintage denim\", \"a winter coat\" — we map it to the right clothing, footwear and boutique shops near you automatically.",
    link: null,
  },
  {
    label: "Live map",
    title: "Every nearby shop, on the map.",
    desc: "Results pin straight onto an interactive map, sorted by walking distance. Tap any pin to see the address, opening hours, and website.",
    link: null,
  },
  {
    label: "Outfit list",
    title: "Building a whole outfit? Find it all in one go.",
    desc: "Add every piece you want, then let Pinpoint search for all of them at once — each grouped and sorted by how close the shop is.",
    link: { href: "/wishlist", text: "Try your list →" },
  },
];

function AppMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#E3E1DB] shadow-sm bg-white select-none">
      {/* App header strip */}
      <div className="px-4 py-2.5 border-b border-[#E3E1DB] flex items-center gap-2.5 bg-[#F7F6F3]">
        <div className="w-5 h-5 rounded bg-[#141412] flex items-center justify-center shrink-0">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <span className="text-[11px] font-semibold text-[#141412]">Pinpoint</span>
        <div className="ml-auto w-32 bg-white rounded-md h-5 border border-[#E3E1DB] flex items-center px-2 gap-1.5">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6B6A63" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4-4" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] text-[#6B6A63]">Nike trainers</span>
        </div>
      </div>

      <div className="flex" style={{ height: 210 }}>
        {/* Left panel — shop list */}
        <div className="w-36 shrink-0 border-r border-[#E3E1DB] p-2 space-y-1.5 bg-[#F7F6F3] overflow-hidden">
          {[
            { name: "JD Sports", dist: "0.2 km", active: true },
            { name: "Foot Locker", dist: "0.6 km", active: false },
            { name: "size?", dist: "1.1 km", active: false },
          ].map((c, i) => (
            <div key={i} className={`p-2 rounded-lg border ${c.active ? "border-[#141412] bg-white" : "border-[#E3E1DB] bg-white"}`}>
              <div className="text-[9px] font-semibold text-[#141412] truncate leading-tight mb-0.5">{c.name}</div>
              <div className="text-[8px] text-[#6B6A63] mb-1.5">{c.dist} away</div>
              <div className="flex items-center gap-1">
                <span className="text-[7px] bg-[#F7F6F3] border border-[#E3E1DB] px-1.5 py-0.5 rounded text-[#57554E]">Shoes</span>
                <span className="text-[7px] text-[#6B6A63]">est. ££</span>
              </div>
            </div>
          ))}
        </div>

        {/* Map area */}
        <div className="flex-1 relative overflow-hidden bg-[#DDD9D0]">
          {/* Very subtle grid */}
          {[25, 50, 75].map((p) => (
            <div key={`h${p}`} className="absolute bg-[#141412]/[0.06] h-px w-full" style={{ top: `${p}%` }} />
          ))}
          {[25, 50, 75].map((p) => (
            <div key={`v${p}`} className="absolute bg-[#141412]/[0.06] w-px h-full" style={{ left: `${p}%` }} />
          ))}
          {/* Map pins */}
          {[
            { x: 42, y: 40, active: true },
            { x: 66, y: 52, active: false },
            { x: 24, y: 64, active: false },
            { x: 70, y: 26, active: false },
            { x: 54, y: 74, active: false },
          ].map((p, i) => (
            <div
              key={i}
              className={`absolute rounded-full border-2 ${p.active ? "w-3.5 h-3.5 bg-[#141412] border-white shadow" : "w-2.5 h-2.5 bg-[#57554E] border-[#EAE8E3]"}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
            />
          ))}
          {/* User location */}
          <div
            className="absolute w-3 h-3 rounded-full bg-[#141412]/20 border-2 border-[#141412]"
            style={{ left: "48%", top: "47%", transform: "translate(-50%,-50%)" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-[#F7F6F3] text-[#141412] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_JSON_LD) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F7F6F3]/95 backdrop-blur-sm border-b border-[#E3E1DB] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#141412] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <span className="font-semibold text-sm">Pinpoint</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/wishlist" className="text-sm text-[#57554E] hover:text-[#141412] transition-colors hidden sm:block">
            Wishlist
          </Link>
          <Link href="/search" className="text-sm bg-[#141412] hover:bg-[#2A2A28] text-white font-medium px-4 py-2 rounded-lg transition-colors">
            Open App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[1fr_380px] gap-10 xl:gap-16 items-center fade-up">
          <div>
            <h1 className="text-[clamp(2.6rem,5.5vw,4.6rem)] font-bold leading-[1.08] tracking-tight text-[#141412] mb-5">
              Find the clothes<br />you want, nearby.
            </h1>
            <p className="text-[1.0625rem] text-[#57554E] leading-relaxed mb-7 max-w-md">
              Search a brand or a clothing item and see the local shops likely to sell it — powered by
              crowd-sourced OpenStreetMap data. Free, fast, and no account needed.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Link
                href="/search"
                className="bg-[#141412] hover:bg-[#2A2A28] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Start searching
              </Link>
              <Link href="/wishlist" className="text-sm text-[#57554E] hover:text-[#141412] transition-colors">
                Build an outfit list →
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CHIPS.map((chip) => (
                <Link
                  key={chip}
                  href={`/search?q=${encodeURIComponent(chip)}`}
                  className="text-xs text-[#57554E] hover:text-[#141412] bg-white hover:bg-[#EAE8E3] border border-[#E3E1DB] px-3 py-1.5 rounded-full transition-colors"
                >
                  {chip}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-[#E3E1DB]">
        <p className="text-[10px] text-[#6B6A63] uppercase tracking-widest font-medium mb-8">What you get</p>
        <div>
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="py-7 border-b border-[#E3E1DB] grid sm:grid-cols-[180px_1fr] gap-3 sm:gap-10"
            >
              <span className="text-[10px] text-[#6B6A63] uppercase tracking-wide font-medium pt-[3px]">{f.label}</span>
              <div>
                <h3 className="font-semibold text-[#141412] mb-1.5 text-[0.9375rem]">{f.title}</h3>
                <p className="text-sm text-[#57554E] leading-relaxed">{f.desc}</p>
                {f.link && (
                  <Link
                    href={f.link.href}
                    className="inline-block mt-3 text-sm font-medium text-[#141412] hover:text-[#57554E] transition-colors"
                  >
                    {f.link.text}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wishlist promo */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E3E1DB] p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#6B6A63] uppercase tracking-widest font-medium mb-3">Outfit list</p>
            <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight text-[#141412] mb-3 leading-tight">
              Putting an outfit together?<br className="hidden sm:block" /> Find every piece in one go.
            </h2>
            <p className="text-sm text-[#57554E] leading-relaxed mb-6 max-w-sm">
              Add trainers, a denim jacket, a band tee — whatever you&apos;re after. Pinpoint searches for every item simultaneously and maps the nearest shops for each.
            </p>
            <Link
              href="/wishlist"
              className="inline-flex items-center gap-2 bg-[#141412] hover:bg-[#2A2A28] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Build your list →
            </Link>
          </div>

          {/* Mini outfit-list preview */}
          <div className="w-full sm:w-52 shrink-0 bg-[#F7F6F3] rounded-xl border border-[#E3E1DB] p-4">
            <p className="text-[9px] text-[#6B6A63] uppercase tracking-widest font-medium mb-3">My list</p>
            {[
              { name: "Nike trainers", count: 12 },
              { name: "denim jacket", count: 5 },
              { name: "band tee", count: 8 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-[#E3E1DB] last:border-0">
                <span className="text-xs text-[#141412]">{item.name}</span>
                <span className="text-[10px] text-[#6B6A63] shrink-0 ml-2">{item.count} shops</span>
              </div>
            ))}
            <div className="mt-3">
              <div className="w-full bg-[#141412] rounded-lg py-2 text-white text-[10px] font-semibold text-center">
                3 / 3 items found
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E3E1DB] px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#141412] flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <span className="text-sm font-semibold">Pinpoint</span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#57554E]">
              <Link href="/search" className="hover:text-[#141412] transition-colors">Search</Link>
              <Link href="/directory" className="hover:text-[#141412] transition-colors">Directory</Link>
              <Link href="/about" className="hover:text-[#141412] transition-colors">About</Link>
              <Link href="/wishlist" className="hover:text-[#141412] transition-colors">Wishlist</Link>
              <Link href="/privacy" className="hover:text-[#141412] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#141412] transition-colors">Terms</Link>
            </nav>
          </div>
          <div className="text-xs text-[#6B6A63] leading-relaxed">
            <span className="text-[#57554E] font-medium">Popular brands:</span>{" "}
            {[
              ["Nike", "nike"], ["Adidas", "adidas"], ["New Balance", "new-balance"],
              ["Dr. Martens", "dr-martens"], ["Levi's", "levis"], ["The North Face", "the-north-face"],
              ["Carhartt", "carhartt"], ["JD Sports", "jd-sports"],
            ].map(([name, slug], i, arr) => (
              <span key={slug}>
                <Link href={`/brand/${slug}`} className="hover:text-[#141412] underline underline-offset-2 transition-colors">{name}</Link>
                {i < arr.length - 1 ? " · " : ""}
              </span>
            ))}
            {" · "}
            <Link href="/directory" className="hover:text-[#141412] underline underline-offset-2 transition-colors">all brands & cities</Link>
          </div>
          <p className="text-xs text-[#6B6A63] leading-relaxed max-w-2xl">
            Map data ©{" "}
            <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#141412] transition-colors">
              OpenStreetMap
            </a>{" "}
            contributors; tiles by{" "}
            <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#141412] transition-colors">
              OpenFreeMap
            </a>
            . Results are nearby shops likely to stock a brand or item based on community data — not confirmed
            stock. Listings and price estimates may be incomplete or out of date; always confirm with the shop.
          </p>
        </div>
      </footer>
    </div>
  );
}
