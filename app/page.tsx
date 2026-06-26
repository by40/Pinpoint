import Link from "next/link";
import { PageHeader, PageFooter } from "@/components/SiteChrome";
import { Section, Kicker, Stamp } from "@/components/Layout";

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
    <div className="rounded-2xl overflow-hidden border border-line shadow-[0_20px_50px_-20px_rgba(107,43,242,0.35)] bg-surface select-none">
      {/* App header strip */}
      <div className="px-4 py-2.5 border-b border-line flex items-center gap-2.5 bg-panel">
        <div className="w-5 h-5 rounded bg-accent flex items-center justify-center shrink-0">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <span className="text-[11px] font-bold text-ink">Pinpoint</span>
        <div className="ml-auto w-32 bg-surface rounded-md h-5 border border-line flex items-center px-2 gap-1.5">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-faint">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4-4" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] text-faint">Nike trainers</span>
        </div>
      </div>

      <div className="flex" style={{ height: 210 }}>
        {/* Left panel — shop list */}
        <div className="w-36 shrink-0 border-r border-line p-2 space-y-1.5 bg-panel overflow-hidden">
          {[
            { name: "JD Sports", dist: "0.2 km", active: true },
            { name: "Foot Locker", dist: "0.6 km", active: false },
            { name: "size?", dist: "1.1 km", active: false },
          ].map((c, i) => (
            <div key={i} className={`p-2 rounded-lg border bg-surface ${c.active ? "border-accent" : "border-line"}`}>
              <div className="text-[9px] font-bold text-ink truncate leading-tight mb-0.5">{c.name}</div>
              <div className="text-[8px] text-faint mb-1.5">{c.dist} away</div>
              <div className="flex items-center gap-1">
                <span className="text-[7px] bg-panel border border-line px-1.5 py-0.5 rounded text-muted">Shoes</span>
                <span className="text-[7px] text-faint">est. ££</span>
              </div>
            </div>
          ))}
        </div>

        {/* Map area */}
        <div className="flex-1 relative overflow-hidden bg-accent-soft">
          {/* Very subtle grid */}
          {[25, 50, 75].map((p) => (
            <div key={`h${p}`} className="absolute bg-accent/[0.08] h-px w-full" style={{ top: `${p}%` }} />
          ))}
          {[25, 50, 75].map((p) => (
            <div key={`v${p}`} className="absolute bg-accent/[0.08] w-px h-full" style={{ left: `${p}%` }} />
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
              className={`absolute rounded-full border-2 ${p.active ? "w-3.5 h-3.5 bg-accent border-white shadow" : "w-2.5 h-2.5 bg-accent/55 border-white"}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
            />
          ))}
          {/* User location */}
          <div
            className="absolute w-3 h-3 rounded-full bg-ink/20 border-2 border-ink"
            style={{ left: "48%", top: "47%", transform: "translate(-50%,-50%)" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-bg text-ink min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_JSON_LD) }}
      />

      <PageHeader />

      {/* Hero */}
      <Section size="wide" className="pt-12 pb-14 sm:pt-16">
        <div className="grid md:grid-cols-[1fr_380px] gap-10 xl:gap-16 items-center fade-up">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Kicker className="text-accent">Local clothing index</Kicker>
              <span className="h-px flex-1 bg-line" />
              <Stamp className="text-accent border-accent">Free</Stamp>
            </div>
            <h1 className="font-display font-bold uppercase leading-[0.92] tracking-[-0.02em] text-ink text-[clamp(3rem,8vw,6rem)] mb-6">
              Find the<br /><span className="text-accent">clothes</span> you<br />want, nearby.
            </h1>
            <p className="text-[1.0625rem] text-muted leading-relaxed mb-7 max-w-md">
              Search a brand or a clothing item and see the local shops likely to sell it — powered by
              crowd-sourced OpenStreetMap data. Free, fast, and no account needed.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link
                href="/search"
                className="bg-accent hover:bg-accent-hover text-on-accent font-bold uppercase tracking-wide px-7 py-3.5 rounded-xl text-sm transition-colors shadow-[0_8px_24px_-8px_rgba(107,43,242,0.6)]"
              >
                Start searching →
              </Link>
              <Link href="/wishlist" className="text-sm font-semibold text-muted hover:text-accent transition-colors">
                Build an outfit list
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <Link
                  key={chip}
                  href={`/search?q=${encodeURIComponent(chip)}`}
                  className="text-xs font-medium text-accent bg-accent-soft hover:bg-accent hover:text-on-accent px-3 py-1.5 rounded-full transition-colors"
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
      </Section>

      {/* Stats band */}
      <Section band="ink" className="border-y-2 border-ink" innerClassName="py-5">
        <div className="grid grid-cols-3 divide-x divide-white/15 text-center">
          {[["40+", "Brands"], ["38", "UK cities"], ["3D", "Live map"]].map(([big, label]) => (
            <div key={label} className="px-2">
              <div className="font-display font-bold text-2xl sm:text-3xl">{big}</div>
              <div className="kicker text-white/50 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Features — numbered grid */}
      <Section size="wide" className="py-16">
        <Kicker className="text-accent mb-8 block">What you get</Kicker>
        <div className="grid sm:grid-cols-2 border-t-2 border-l-2 border-ink">
          {FEATURES.map((f, i) => (
            <div key={f.label} className="border-r-2 border-b-2 border-ink p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <Kicker className="text-faint">{f.label}</Kicker>
                <span className="font-display font-bold text-3xl text-line">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-display font-bold text-ink mb-2 text-xl tracking-tight leading-snug">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              {f.link && (
                <Link
                  href={f.link.href}
                  className="inline-block mt-4 text-sm font-bold uppercase tracking-wide text-accent hover:text-accent-hover transition-colors"
                >
                  {f.link.text}
                </Link>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Wishlist promo — full-bleed accent band */}
      <Section band="accent" className="py-14 sm:py-16">
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <Kicker className="text-white/70 mb-3 block">Outfit list</Kicker>
            <h2 className="font-display font-bold uppercase tracking-tight mb-3 leading-[0.95] text-[clamp(1.8rem,4vw,2.75rem)]">
              Building an outfit?<br className="hidden sm:block" /> Find every piece in one go.
            </h2>
            <p className="text-sm text-white/80 leading-relaxed mb-6 max-w-sm">
              Add trainers, a denim jacket, a band tee — whatever you&apos;re after. Pinpoint searches for every item simultaneously and maps the nearest shops for each.
            </p>
            <Link
              href="/wishlist"
              className="inline-flex items-center gap-2 bg-surface hover:bg-panel text-ink font-bold uppercase tracking-wide px-5 py-3 rounded-xl text-sm transition-colors"
            >
              Build your list →
            </Link>
          </div>

          {/* Mini outfit-list preview */}
          <div className="w-full sm:w-52 shrink-0 bg-surface rounded-2xl p-4 text-ink">
            <p className="kicker text-faint mb-3">My list</p>
            {[
              { name: "Nike trainers", count: 12 },
              { name: "denim jacket", count: 5 },
              { name: "band tee", count: 8 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                <span className="text-xs text-ink">{item.name}</span>
                <span className="text-[10px] text-faint shrink-0 ml-2">{item.count} shops</span>
              </div>
            ))}
            <div className="mt-3">
              <div className="w-full bg-accent rounded-lg py-2 text-on-accent text-[10px] font-bold text-center">
                3 / 3 items found
              </div>
            </div>
          </div>
        </div>
      </Section>

      <PageFooter />
    </div>
  );
}
