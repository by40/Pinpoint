import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guides";
import { getBrand } from "@/lib/brands";
import { getCity } from "@/lib/cities";
import { PageHeader, PageFooter } from "@/components/SiteChrome";
import { Container, Section, Kicker } from "@/components/Layout";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pinpointapp.uk";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title: `${guide.title} · Pinpoint`, description: guide.description, url: `/guides/${guide.slug}`, type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const brands = guide.relatedBrands.map(getBrand).filter((b) => b !== undefined);
  const cities = guide.relatedCities.map(getCity).filter((c) => c !== undefined);
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        datePublished: guide.updated,
        dateModified: guide.updated,
        author: { "@type": "Organization", name: "Pinpoint" },
        publisher: { "@type": "Organization", name: "Pinpoint", logo: `${SITE_URL}/icon.svg` },
        mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "/guides" },
          { "@type": "ListItem", position: 3, name: guide.title, item: `/guides/${guide.slug}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader />

      {/* Editorial hero */}
      <Section band="panel" size="narrow" className="border-b-2 border-ink pt-8 pb-10">
        <nav className="kicker text-faint mb-5">
          <Link href="/" className="hover:text-accent">Home</Link> /{" "}
          <Link href="/guides" className="hover:text-accent">Guides</Link>
        </nav>
        <Kicker className="text-accent mb-4 block">Guide</Kicker>
        <h1 className="font-display font-bold uppercase tracking-[-0.02em] leading-[0.95] text-[clamp(2rem,5vw,3.25rem)] mb-3">{guide.title}</h1>
        <p className="kicker text-faint">Updated 25 June 2026</p>
      </Section>

      <Container size="narrow" className="py-12">
        <p className="text-[1.0625rem] text-muted leading-relaxed mb-10">{guide.intro}</p>

        {guide.sections.map((s, i) => (
          <section key={s.heading} className="mb-10">
            <Kicker index={i + 1} className="text-faint mb-2 block" />
            <h2 className="font-display text-xl font-bold tracking-tight text-ink mb-3">{s.heading}</h2>
            <div className="space-y-3">
              {s.paras.map((p, j) => (
                <p key={j} className="text-sm text-muted leading-relaxed">{p}</p>
              ))}
            </div>
          </section>
        ))}

        {/* Try these searches */}
        <section className="mb-10 bg-ink text-white rounded-2xl p-6 sm:p-7">
          <Kicker className="text-accent mb-3 block">Try these searches</Kicker>
          <div className="flex flex-wrap gap-2">
            {guide.searches.map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="text-sm font-medium text-white hover:text-ink bg-white/10 hover:bg-white border border-white/20 px-3 py-1.5 rounded-full transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 mt-5 bg-accent hover:bg-accent-hover text-on-accent font-bold uppercase tracking-wide px-5 py-3 rounded-xl text-sm transition-colors"
          >
            Open the live map →
          </Link>
        </section>

        {/* Related internal links */}
        {(brands.length > 0 || cities.length > 0) && (
          <section className="mb-10 space-y-6">
            {brands.length > 0 && (
              <div>
                <Kicker className="text-faint mb-3 block">Related brands</Kicker>
                <div className="flex flex-wrap gap-2">
                  {brands.map((b) => (
                    <Link key={b.slug} href={`/brand/${b.slug}`} className="text-sm font-medium text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">{b.name}</Link>
                  ))}
                </div>
              </div>
            )}
            {cities.length > 0 && (
              <div>
                <Kicker className="text-faint mb-3 block">Browse by city</Kicker>
                <div className="flex flex-wrap gap-2">
                  {cities.map((c) => (
                    <Link key={c.slug} href={`/clothes-shops/${c.slug}`} className="text-sm font-medium text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">{c.name}</Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* More guides */}
        <section className="pt-8 border-t-2 border-ink">
          <Kicker className="text-faint mb-4 block">More guides</Kicker>
          <ul className="divide-y divide-line border-t border-line">
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="flex items-center justify-between gap-3 py-3 text-sm font-display font-bold text-ink hover:text-accent transition-colors">
                  {g.title} <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <PageFooter />
    </div>
  );
}
