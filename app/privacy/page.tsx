import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Pinpoint handles your location and data: no accounts, no tracking, no ads. Your wishlist stays in your browser.",
  alternates: { canonical: "/privacy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="text-base font-bold tracking-tight text-[#141412] mb-2">{title}</h2>
      <div className="text-sm text-[#57554E] leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#141412]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F7F6F3]/95 backdrop-blur-sm border-b border-[#E3E1DB] px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#141412] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <span className="font-semibold text-sm">Pinpoint</span>
        </Link>
        <Link href="/search" className="text-sm text-[#57554E] hover:text-[#141412] transition-colors">
          Open App
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Privacy</h1>
        <p className="text-sm text-[#6B6A63] mb-10">Last updated 25 June 2026</p>

        <p className="text-sm text-[#57554E] leading-relaxed mb-10">
          Pinpoint is built to be private by default. There are <strong className="text-[#141412] font-semibold">no accounts,
          no advertising, no cross-site tracking, and no cookies</strong>. We don&apos;t run a database that stores
          your searches or your location. We use a single privacy-focused, cookieless analytics tool to count visits
          and measure page speed in aggregate — described below. This page explains exactly what the app touches and where it goes.
        </p>

        <Section title="What Pinpoint accesses">
          <p>
            <strong className="text-[#141412] font-semibold">Your location</strong> — only when you tap &ldquo;Find Shops&rdquo; or
            &ldquo;Find shops for items&rdquo;. Your browser asks your permission, then provides approximate coordinates. We use them
            once, in that moment, to look up nearby shops. We never store them.
          </p>
          <p>
            <strong className="text-[#141412] font-semibold">What you type</strong> — the item you search for is sent with
            your coordinates to fetch results (see below). It isn&apos;t saved on any server we control.
          </p>
          <p>
            <strong className="text-[#141412] font-semibold">Your wishlist &amp; sound preference</strong> — these live only
            in your own browser&apos;s local storage. They never leave your device and are never sent to us.
          </p>
        </Section>

        <Section title="Where your data goes">
          <p>
            Pinpoint has no backend database. To return results, your coordinates and search term are sent to two
            third-party map services:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-[#141412] font-semibold">OpenStreetMap / Overpass API</strong> — receives your
              coordinates and query to find matching shops nearby.{" "}
              <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="text-[#141412] underline underline-offset-2 hover:text-[#57554E]">
                Their privacy policy
              </a>
              .
            </li>
            <li>
              <strong className="text-[#141412] font-semibold">OpenFreeMap</strong> — serves the map tiles you see, based
              on the area you&apos;re viewing.{" "}
              <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer" className="text-[#141412] underline underline-offset-2 hover:text-[#57554E]">
                openfreemap.org
              </a>
              .
            </li>
          </ul>
          <p>
            As with any web request, these services may temporarily see your IP address and the request needed to serve
            you. We don&apos;t share anything beyond what&apos;s required to return your results.
          </p>
        </Section>

        <Section title="Analytics">
          <p>
            To understand roughly how many people use Pinpoint and how fast pages load, we use{" "}
            <strong className="text-[#141412] font-semibold">Vercel Web Analytics and Speed Insights</strong>. These are
            privacy-focused and <strong className="text-[#141412] font-semibold">do not use cookies</strong>, do not
            fingerprint your device, and do not track you across other websites. They record aggregated, anonymised
            information such as the page visited, referrer, approximate country, and anonymous performance timings
            (e.g. Core Web Vitals). This data cannot be used to identify you, and we use it only to improve the app —
            our legal basis is our legitimate interest in maintaining and improving the service.{" "}
            <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#141412] underline underline-offset-2 hover:text-[#57554E]">
              How Vercel Analytics handles data
            </a>
            .
          </p>
        </Section>

        <Section title="What we don't do">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>No accounts, sign-ups, or passwords.</li>
            <li>No cookies, advertising pixels, cross-site tracking, or device fingerprinting.</li>
            <li>No selling or sharing of personal data.</li>
            <li>No server-side log of your searches, location, or wishlist.</li>
          </ul>
        </Section>

        <Section title="Your control">
          <p>
            You can deny or revoke location permission anytime in your browser — Pinpoint simply won&apos;t run a search
            without it. You can clear your wishlist and sound preference at any time by clearing this site&apos;s local
            storage in your browser settings, or by removing items in the app.
          </p>
        </Section>

        <Section title="Accuracy of results">
          <p>
            Pinpoint shows nearby shops <strong className="text-[#141412] font-semibold">likely</strong> to sell a brand or
            type of clothing, based on community-maintained OpenStreetMap shop and brand data — it does not check live
            stock, so it can&apos;t confirm a shop actually has a specific item. Listings may be incomplete or out of date,
            and price indicators are rough estimates based on shop type, not live prices. Always confirm with the shop directly.
          </p>
        </Section>

        <Section title="Changes &amp; contact">
          <p>
            If this policy changes, we&apos;ll update the date above. Questions about privacy? Email{" "}
            <a href="mailto:hello@pinpointapp.uk" className="text-[#141412] underline underline-offset-2 hover:text-[#57554E]">
              hello@pinpointapp.uk
            </a>
            .
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3E1DB] px-6 py-8">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#141412] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Pinpoint</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#6B6A63]">
            <Link href="/" className="hover:text-[#141412] transition-colors">Home</Link>
            <Link href="/search" className="hover:text-[#141412] transition-colors">Search</Link>
            <Link href="/terms" className="hover:text-[#141412] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
