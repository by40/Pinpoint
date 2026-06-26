import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageFooter } from "@/components/SiteChrome";

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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-[1.1] mb-4">About Pinpoint</h1>
        <p className="text-[1.0625rem] text-muted leading-relaxed mb-10 max-w-xl">
          Pinpoint helps you find the clothes and brands you want in shops near you — a fast, private way to shop local
          instead of defaulting to online.
        </p>

        <section className="mb-10">
          <h2 className="text-base font-bold tracking-tight mb-4">How it works</h2>
          <ol className="space-y-3">
            {[
              ["Search a brand or item", "Type something like “Adidas Sambas”, “a denim jacket” or “Dr. Martens”."],
              ["Share your location", "Allow location or enter a town/postcode — your location is never stored."],
              ["See nearby shops on a map", "Results are mapped in 3D and sorted by distance, with brand stores first."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{t}</h3>
                  <p className="text-sm text-muted leading-relaxed">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-10 p-5 rounded-2xl border border-line bg-surface">
          <h2 className="text-base font-bold tracking-tight mb-2">An honest note on accuracy</h2>
          <p className="text-sm text-muted leading-relaxed">
            Pinpoint uses community OpenStreetMap data, which has no live inventory. So results are shops{" "}
            <strong className="text-ink font-semibold">likely</strong> to sell what you searched — not a guarantee
            it&apos;s in stock. Listings can be incomplete or out of date; always confirm with the shop.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-base font-bold tracking-tight mb-4">FAQ</h2>
          <div className="space-y-5">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-semibold text-ink mb-1">{f.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Start searching →
        </Link>
      </main>

      <PageFooter />
    </div>
  );
}
