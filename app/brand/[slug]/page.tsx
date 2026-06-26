import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURED_BRANDS, getBrand } from "@/lib/brands";
import { PageHeader, PageFooter } from "@/components/SiteChrome";
import { Container, Section, Kicker } from "@/components/Layout";

export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURED_BRANDS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};
  const title = `Where to buy ${brand.name} near you`;
  const description = `Find local shops likely to sell ${brand.name} (${brand.sells}) near you. ${brand.blurb}`;
  return {
    title,
    description,
    alternates: { canonical: `/brand/${brand.slug}` },
    openGraph: { title: `${title} · Pinpoint`, description, url: `/brand/${brand.slug}` },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const searchHref = `/search?q=${encodeURIComponent(brand.query)}`;
  const related = FEATURED_BRANDS.filter((b) => b.slug !== brand.slug).slice(0, 8);

  const faqs = [
    {
      q: `Where can I buy ${brand.name} near me?`,
      a: `Pinpoint maps the nearby shops most likely to stock ${brand.name} — including ${brand.name} stores where they exist, plus the kind of shops that carry ${brand.sells}. Open the app, allow location (or type your town), and search "${brand.query}".`,
    },
    {
      q: `Does Pinpoint show live ${brand.name} stock?`,
      a: `No. Pinpoint shows shops likely to sell ${brand.name} based on community OpenStreetMap data — it can't confirm a specific item is in stock. Always check with the shop before making a journey.`,
    },
    { q: `Is Pinpoint free?`, a: `Yes — Pinpoint is free, with no account needed.` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Brands", item: "/directory" },
          { "@type": "ListItem", position: 3, name: brand.name, item: `/brand/${brand.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader />

      {/* Editorial hero */}
      <Section band="panel" className="border-b-2 border-ink pt-8 pb-10">
        <nav className="kicker text-faint mb-5">
          <Link href="/" className="hover:text-accent">Home</Link> /{" "}
          <Link href="/directory#brands" className="hover:text-accent">Brands</Link> /{" "}
          <span className="text-ink">{brand.name}</span>
        </nav>
        <Kicker className="text-accent mb-4 block">Brand</Kicker>
        <h1 className="font-display font-bold uppercase tracking-[-0.02em] leading-[0.92] text-[clamp(2.4rem,6vw,4.5rem)] mb-5">
          Where to buy<br /><span className="text-accent">{brand.name}</span> near you
        </h1>
        <p className="text-[1.0625rem] text-muted leading-relaxed mb-6 max-w-xl">{brand.blurb}</p>
        <Link
          href={searchHref}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-bold uppercase tracking-wide px-6 py-3.5 rounded-xl text-sm transition-colors"
        >
          Find {brand.name} near you →
        </Link>
      </Section>

      <Container size="default" className="py-12 space-y-12">
        <section>
          <Kicker index={1} className="text-faint mb-4 block">Popular searches</Kicker>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {brand.examples.map((ex) => (
              <Link
                key={ex}
                href={`/search?q=${encodeURIComponent(ex)}`}
                className="text-sm font-medium text-ink hover:text-on-accent bg-surface hover:bg-accent border-2 border-ink px-4 py-3 rounded-xl transition-colors"
              >
                {ex} →
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-2xl">
          <Kicker index={2} className="text-faint mb-3 block">How it works</Kicker>
          <h2 className="font-display font-bold text-xl tracking-tight mb-3">How Pinpoint finds {brand.name}</h2>
          <p className="text-sm text-muted leading-relaxed">
            When you search for {brand.name}, Pinpoint looks for nearby {brand.name} stores plus the shops that typically
            carry {brand.sells}, using community-maintained OpenStreetMap data. Results are mapped in 3D and sorted by
            distance, with confirmed {brand.name} stockists shown first. It shows shops <strong className="text-ink font-semibold">likely</strong> to
            sell {brand.name} — not live stock — so it&apos;s always worth a quick call ahead.
          </p>
        </section>

        <section className="max-w-2xl">
          <Kicker index={3} className="text-faint mb-4 block">Questions</Kicker>
          <div className="divide-y divide-line border-t border-line">
            {faqs.map((f) => (
              <div key={f.q} className="py-4">
                <h3 className="font-display text-base font-bold text-ink mb-1.5">{f.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-8 border-t-2 border-ink">
          <Kicker index={4} className="text-faint mb-4 block">Other brands</Kicker>
          <div className="flex flex-wrap gap-2">
            {related.map((b) => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                className="text-sm font-medium text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      </Container>

      <PageFooter />
    </div>
  );
}
