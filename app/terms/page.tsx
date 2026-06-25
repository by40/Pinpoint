import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms for using Pinpoint: a free, as-is tool that surfaces nearby shops from community OpenStreetMap data. Always confirm details with the shop.",
  alternates: { canonical: "/terms" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="text-base font-bold tracking-tight text-[#141412] mb-2">{title}</h2>
      <div className="text-sm text-[#57554E] leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Terms of Use</h1>
        <p className="text-sm text-[#6B6A63] mb-10">Last updated 25 June 2026</p>

        <p className="text-sm text-[#57554E] leading-relaxed mb-10">
          These terms govern your use of Pinpoint (the &ldquo;Service&rdquo;), available at pinpointapp.uk. By using the
          Service you agree to them. If you don&apos;t agree, please don&apos;t use it. Pinpoint is a free tool with no
          accounts — these terms are intentionally short and plain.
        </p>

        <Section title="What Pinpoint is">
          <p>
            Pinpoint helps you find local shops that may sell an item, by matching your search to categories in
            community-maintained <strong className="text-[#141412] font-semibold">OpenStreetMap</strong> data and showing
            nearby results on a map. It is an informational tool — not a shop, a marketplace, or a booking service. We
            don&apos;t sell anything and we aren&apos;t affiliated with the shops shown.
          </p>
        </Section>

        <Section title="Accuracy &amp; no warranty">
          <p>
            Shop listings, opening hours, contact details, and locations come from OpenStreetMap and may be incomplete,
            inaccurate, or out of date. Price indicators (£, ££, £££) are{" "}
            <strong className="text-[#141412] font-semibold">rough estimates based on shop type only</strong> — not live
            or quoted prices. Always confirm availability, hours, and price with the shop directly before relying on a
            result or making a journey.
          </p>
          <p>
            The Service is provided <strong className="text-[#141412] font-semibold">&ldquo;as is&rdquo; and &ldquo;as
            available&rdquo;</strong>, without warranties of any kind, whether express or implied. We don&apos;t guarantee
            that the Service will be uninterrupted, error-free, or that results will be complete or correct.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use the Service unlawfully or to infringe anyone&apos;s rights.</li>
            <li>Scrape, overload, or attempt to disrupt the Service or the third-party data sources it relies on.</li>
            <li>Attempt to bypass rate limits or access the Service through automated bulk requests.</li>
            <li>Reverse-engineer, resell, or misrepresent the Service.</li>
          </ul>
        </Section>

        <Section title="Third-party data &amp; services">
          <p>
            Map data is © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-[#141412] underline underline-offset-2 hover:text-[#57554E]">OpenStreetMap</a>{" "}
            contributors, available under the Open Database License (ODbL). Map tiles are served by{" "}
            <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer" className="text-[#141412] underline underline-offset-2 hover:text-[#57554E]">OpenFreeMap</a>. Your use of
            map data and tiles is also subject to those providers&apos; terms. Links to shop websites lead to sites we
            don&apos;t control and aren&apos;t responsible for.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the fullest extent permitted by law, Pinpoint and its operators won&apos;t be liable for any loss or damage
            arising from your use of, or reliance on, the Service or its results — including wasted journeys, incorrect
            listings, or unavailable items. Nothing in these terms limits liability that cannot be limited under
            applicable law.
          </p>
        </Section>

        <Section title="Privacy">
          <p>
            How we handle your location and data is explained in our{" "}
            <Link href="/privacy" className="text-[#141412] underline underline-offset-2 hover:text-[#57554E]">Privacy Policy</Link>.
          </p>
        </Section>

        <Section title="Changes, governing law &amp; contact">
          <p>
            We may update these terms; if we do, we&apos;ll change the date above. These terms are governed by the laws
            of England and Wales, and any disputes are subject to the exclusive jurisdiction of its courts. Questions?
            Email{" "}
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
            <Link href="/privacy" className="hover:text-[#141412] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
