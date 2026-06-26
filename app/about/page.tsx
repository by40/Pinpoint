import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageFooter } from "@/components/SiteChrome";
import { Container, Section, Kicker } from "@/components/Layout";

export const metadata: Metadata = {
  title: "About & FAQ",
  description:
    "What Pinpoint is, how it finds clothing brands and items in local shops, and answers to common questions. Free, private, no account needed.",
  alternates: { canonical: "/about" },
};

const FAQS = [
  {
    q: "What is Pinpoint?",
    a: "Pinpoint is a free tool that helps you find local shops likely to sell a clothing brand or item. Search something like “Nike trainers” or “vintage Levi's”, and it maps nearby shops sorted by distance.",
  },
  {
    q: "How does it know which shops sell what?",
    a: "It matches your search to shop types and brand tags in community-maintained OpenStreetMap data — for example, a search for Nike looks for Nike stores plus the shoe and sportswear shops that typically carry it.",
  },
  {
    q: "Does it show live stock?",
    a: "No. Pinpoint shows shops likely to stock a brand or item, not confirmed inventory. It can't tell you a specific product is on the shelf today, so it's always worth calling ahead.",
  },
  {
    q: "Is it free? Do I need an account?",
    a: "It's completely free and there are no accounts, sign-ups, or passwords. Your location is only used to find nearby shops and is never stored.",
  },
  {
    q: "Why does it ask for my location?",
    a: "To find shops near you. You can also type a town or postcode instead if you'd rather not share your location.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader />

      {/* Editorial hero */}
      <Section band="panel" className="border-b-2 border-ink pt-8 pb-10">
        <Kicker className="text-accent mb-4 block">The manifesto</Kicker>
        <h1 className="font-display font-bold uppercase tracking-[-0.02em] leading-[0.9] text-[clamp(2.4rem,6.5vw,4.75rem)] mb-5">
          Shop local,<br />not <span className="text-accent">default online</span>
        </h1>
        <p className="text-[1.0625rem] text-muted leading-relaxed max-w-xl">
          Pinpoint helps you find the clothes and brands you want in shops near you — a fast, private way to shop local
          instead of defaulting to online.
        </p>
      </Section>

      <Container size="default" className="py-12 space-y-12">
        <section>
          <Kicker index={1} className="text-faint mb-4 block">How it works</Kicker>
          <div className="grid sm:grid-cols-3 border-t-2 border-l-2 border-ink">
            {[
              ["Search a brand or item", "Type something like “Adidas Sambas”, “a denim jacket” or “Dr. Martens”."],
              ["Share your location", "Allow location or enter a town/postcode — your location is never stored."],
              ["See nearby shops on a map", "Results are mapped in 3D and sorted by distance, with brand stores first."],
            ].map(([t, d], i) => (
              <div key={t} className="border-r-2 border-b-2 border-ink p-6">
                <span className="font-display font-bold text-3xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-base font-bold text-ink mt-3 mb-1">{t}</h3>
                <p className="text-sm text-muted leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-ink text-white rounded-2xl p-7 sm:p-8">
          <Kicker className="text-accent mb-3 block">Straight up</Kicker>
          <h2 className="font-display text-xl font-bold tracking-tight mb-2">An honest note on accuracy</h2>
          <p className="text-sm text-white/75 leading-relaxed max-w-2xl">
            Pinpoint uses community OpenStreetMap data, which has no live inventory. So results are shops{" "}
            <strong className="text-white font-semibold">likely</strong> to sell what you searched — not a guarantee
            it&apos;s in stock. Listings can be incomplete or out of date; always confirm with the shop.
          </p>
        </section>

        <section className="max-w-2xl">
          <Kicker index={2} className="text-faint mb-4 block">FAQ</Kicker>
          <div className="divide-y divide-line border-t border-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-4">
                <h3 className="font-display text-base font-bold text-ink mb-1.5">{f.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-bold uppercase tracking-wide px-6 py-3.5 rounded-xl text-sm transition-colors"
        >
          Start searching →
        </Link>
      </Container>

      <PageFooter />
    </div>
  );
}
