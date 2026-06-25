import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guides";
import { getBrand } from "@/lib/brands";
import { getCity } from "@/lib/cities";
import { PageHeader, PageFooter } from "@/components/SiteChrome";

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
    <div className="min-h-screen bg-[#F7F6F3] text-[#141412]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <nav className="text-xs text-[#6B6A63] mb-6">
          <Link href="/" className="hover:text-[#141412]">Home</Link> ·{" "}
          <Link href="/guides" className="hover:text-[#141412]">Guides</Link>
        </nav>

        <h1 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-[1.1] mb-3">{guide.title}</h1>
        <p className="text-xs text-[#6B6A63] mb-8">Updated 25 June 2026</p>

        <p className="text-[1.0625rem] text-[#57554E] leading-relaxed mb-8">{guide.intro}</p>

        {guide.sections.map((s) => (
          <section key={s.heading} className="mb-8">
            <h2 className="text-lg font-bold tracking-tight text-[#141412] mb-2">{s.heading}</h2>
            <div className="space-y-3">
              {s.paras.map((p, i) => (
                <p key={i} className="text-sm text-[#57554E] leading-relaxed">{p}</p>
              ))}
            </div>
          </section>
        ))}

        {/* Try these searches */}
        <section className="mb-8 p-5 rounded-2xl border border-[#E3E1DB] bg-white">
          <h2 className="text-sm font-bold tracking-tight mb-3">Try these searches</h2>
          <div className="flex flex-wrap gap-2">
            {guide.searches.map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="text-sm text-[#57554E] hover:text-[#141412] bg-[#F7F6F3] hover:bg-[#EAE8E3] border border-[#E3E1DB] px-3 py-1.5 rounded-full transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 mt-4 bg-[#141412] hover:bg-[#2A2A28] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Open the live map →
          </Link>
        </section>

        {/* Related internal links */}
        {(brands.length > 0 || cities.length > 0) && (
          <section className="mb-8">
            {brands.length > 0 && (
              <div className="mb-4">
                <h2 className="text-[10px] uppercase tracking-widest text-[#6B6A63] font-medium mb-2">Related brands</h2>
                <div className="flex flex-wrap gap-2">
                  {brands.map((b) => (
                    <Link key={b.slug} href={`/brand/${b.slug}`} className="text-sm text-[#57554E] hover:text-[#141412] bg-white hover:bg-[#EAE8E3] border border-[#E3E1DB] px-3 py-1.5 rounded-full transition-colors">{b.name}</Link>
                  ))}
                </div>
              </div>
            )}
            {cities.length > 0 && (
              <div>
                <h2 className="text-[10px] uppercase tracking-widest text-[#6B6A63] font-medium mb-2">Browse by city</h2>
                <div className="flex flex-wrap gap-2">
                  {cities.map((c) => (
                    <Link key={c.slug} href={`/clothes-shops/${c.slug}`} className="text-sm text-[#57554E] hover:text-[#141412] bg-white hover:bg-[#EAE8E3] border border-[#E3E1DB] px-3 py-1.5 rounded-full transition-colors">{c.name}</Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* More guides */}
        <section className="pt-8 border-t border-[#E3E1DB]">
          <h2 className="text-[10px] uppercase tracking-widest text-[#6B6A63] font-medium mb-3">More guides</h2>
          <ul className="space-y-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="text-sm font-medium text-[#141412] hover:text-[#57554E] underline underline-offset-2 transition-colors">{g.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
