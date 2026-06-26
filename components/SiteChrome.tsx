"use client";

import Link from "next/link";
import { useState } from "react";
import Marquee from "@/components/Marquee";
import { Container } from "@/components/Layout";

function Logo({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

const NAV = [
  { label: "Search", href: "/search" },
  { label: "Brands", href: "/directory#brands" },
  { label: "Cities", href: "/directory#cities" },
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
];

// Shared chrome for the static content/SEO pages (brand, city, directory, guides,
// about). The interactive app screens keep their own compact headers.
export function PageHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <Marquee />
      <div className="bg-bg/95 backdrop-blur-sm border-b-2 border-ink">
        <Container size="wide" className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <Logo />
            </div>
            <span className="font-display font-bold text-lg tracking-tight uppercase">Pinpoint</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="kicker text-ink/70 hover:text-accent transition-colors"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="bg-accent hover:bg-accent-hover text-on-accent font-bold text-xs uppercase tracking-wide px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Open App
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden w-9 h-9 -mr-1 flex items-center justify-center text-ink"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
        </Container>
      </div>

      {/* Mobile overlay menu */}
      {open && (
        <div className="md:hidden border-b-2 border-ink bg-bg">
          <Container size="wide" className="py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="kicker text-ink py-3 border-b border-line"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="mt-3 bg-accent text-on-accent font-bold text-center uppercase tracking-wide text-sm px-4 py-3 rounded-lg"
            >
              Open App
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}

const POPULAR_BRANDS: [string, string][] = [
  ["Nike", "nike"], ["Adidas", "adidas"], ["New Balance", "new-balance"],
  ["Dr. Martens", "dr-martens"], ["Levi's", "levis"], ["Carhartt", "carhartt"],
];
const POPULAR_CITIES: [string, string][] = [
  ["London", "london"], ["Manchester", "manchester"], ["Birmingham", "birmingham"],
  ["Glasgow", "glasgow"], ["Leeds", "leeds"], ["Bristol", "bristol"],
];

export function PageFooter() {
  return (
    <footer className="bg-ink text-white mt-16">
      <Container size="wide" className="py-12">
        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <p className="kicker text-white/40 mb-4">Explore</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href="/search" className="hover:text-accent transition-colors">Search</Link></li>
              <li><Link href="/directory" className="hover:text-accent transition-colors">Directory</Link></li>
              <li><Link href="/guides" className="hover:text-accent transition-colors">Guides</Link></li>
              <li><Link href="/wishlist" className="hover:text-accent transition-colors">Outfit list</Link></li>
              <li><Link href="/about" className="hover:text-accent transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="kicker text-white/40 mb-4">Brands</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              {POPULAR_BRANDS.map(([name, slug]) => (
                <li key={slug}><Link href={`/brand/${slug}`} className="hover:text-accent transition-colors">{name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker text-white/40 mb-4">Cities</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              {POPULAR_CITIES.map(([name, slug]) => (
                <li key={slug}><Link href={`/clothes-shops/${slug}`} className="hover:text-accent transition-colors">{name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker text-white/40 mb-4">Legal</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Giant wordmark */}
        <Link href="/" className="block group">
          <span className="font-display font-bold uppercase tracking-tight leading-none text-[clamp(3rem,14vw,9rem)] text-white/95 group-hover:text-accent transition-colors">
            Pinpoint
          </span>
        </Link>

        <p className="text-xs text-white/45 leading-relaxed max-w-2xl mt-6">
          Map data ©{" "}
          <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white transition-colors">OpenStreetMap</a>{" "}
          contributors. Results are nearby shops likely to stock a brand or item based on community data — not
          confirmed stock. Always confirm with the shop. © {new Date().getFullYear()} Pinpoint.
        </p>
      </Container>
    </footer>
  );
}
