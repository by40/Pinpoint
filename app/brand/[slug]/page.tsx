import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURED_BRANDS, getBrand } from "@/lib/brands";
import { PageHeader, PageFooter } from "@/components/SiteChrome";

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
    <div className="min-h-screen bg-[#F7F6F3] text-[#141412]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <nav className="text-xs text-[#6B6A63] mb-6">
          <Link href="/" className="hover:text-[#141412]">Home</Link> ·{" "}
          <Link href="/directory" className="hover:text-[#141412]">Brands</Link> ·{" "}
          <span className="text-[#57554E]">{brand.name}</span>
        </nav>

        <h1 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-[1.1] mb-4">
          Where to buy {brand.name} near you
        </h1>
        <p className="text-[1.0625rem] text-[#57554E] leading-relaxed mb-6 max-w-xl">{brand.blurb}</p>

        <Link
          href={searchHref}
          className="inline-flex items-center gap-2 bg-[#141412] hover:bg-[#2A2A28] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Find {brand.name} near you →
        </Link>

        <section className="mt-10">
          <h2 className="text-base font-bold tracking-tight mb-3">Popular {brand.name} searches</h2>
          <div className="flex flex-wrap gap-2">
            {brand.examples.map((ex) => (
              <Link
                key={ex}
                href={`/search?q=${encodeURIComponent(ex)}`}
                className="text-sm text-[#57554E] hover:text-[#141412] bg-white hover:bg-[#EAE8E3] border border-[#E3E1DB] px-3 py-1.5 rounded-full transition-colors"
              >
                {ex}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-base font-bold tracking-tight mb-2">How Pinpoint finds {brand.name}</h2>
          <p className="text-sm text-[#57554E] leading-relaxed max-w-xl">
            When you search for {brand.name}, Pinpoint looks for nearby {brand.name} stores plus the shops that typically
            carry {brand.sells}, using community-maintained OpenStreetMap data. Results are mapped in 3D and sorted by
            distance, with confirmed {brand.name} stockists shown first. It shows shops <strong className="text-[#141412] font-semibold">likely</strong> to
            sell {brand.name} — not live stock — so it&apos;s always worth a quick call ahead.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-base font-bold tracking-tight mb-4">Questions</h2>
          <div className="space-y-5">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-semibold text-[#141412] mb-1">{f.q}</h3>
                <p className="text-sm text-[#57554E] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 pt-8 border-t border-[#E3E1DB]">
          <h2 className="text-[10px] uppercase tracking-widest text-[#6B6A63] font-medium mb-3">Other brands</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((b) => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                className="text-sm text-[#57554E] hover:text-[#141412] bg-white hover:bg-[#EAE8E3] border border-[#E3E1DB] px-3 py-1.5 rounded-full transition-colors"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
