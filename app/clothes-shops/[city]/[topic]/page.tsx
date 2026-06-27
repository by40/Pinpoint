import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getCity } from "@/lib/cities";
import { TOPICS, getTopic } from "@/lib/topics";
import { getBrand } from "@/lib/brands";
import { queryNearbyShops, type Shop } from "@/lib/overpass";
import { PageHeader, PageFooter } from "@/components/SiteChrome";
import { Container, Section, Kicker } from "@/components/Layout";

// Render on demand, cache weekly — one Overpass call per city×topic per week.
export const revalidate = 604800;

function typeLabel(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; topic: string }>;
}): Promise<Metadata> {
  const { city, topic } = await params;
  const c = getCity(city);
  const t = getTopic(topic);
  if (!c || !t) return {};
  const title = t.metaTitle(c.name);
  const description = t.metaDescription(c.name);
  return {
    title,
    description,
    alternates: { canonical: `/clothes-shops/${c.slug}/${t.slug}` },
    openGraph: { title: `${title} · Pinpoint`, description, url: `/clothes-shops/${c.slug}/${t.slug}` },
  };
}

export default async function CityTopicPage({
  params,
}: {
  params: Promise<{ city: string; topic: string }>;
}) {
  const { city, topic } = await params;
  const c = getCity(city);
  const t = getTopic(topic);
  if (!c || !t) notFound();

  let shops: Shop[] = [];
  let failed = false;
  try {
    shops = await queryNearbyShops(t.query, c.lat, c.lon, 2500);
  } catch {
    failed = true;
  }
  const shown = shops.slice(0, 36);

  const relatedBrands = t.relatedBrands.map(getBrand).filter((b) => b !== undefined);
  const otherTopics = TOPICS.filter((x) => x.slug !== t.slug);
  const otherCities = CITIES.filter((x) => x.slug !== c.slug).slice(0, 14);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Cities", item: "/directory" },
          { "@type": "ListItem", position: 3, name: c.name, item: `/clothes-shops/${c.slug}` },
          { "@type": "ListItem", position: 4, name: t.label, item: `/clothes-shops/${c.slug}/${t.slug}` },
        ],
      },
      ...(shown.length
        ? [{
            "@type": "ItemList",
            name: t.metaTitle(c.name),
            numberOfItems: shown.length,
            itemListElement: shown.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "ClothingStore",
                name: s.name,
                ...(s.address && s.address !== "Address not listed" ? { address: s.address } : {}),
                geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lon },
                ...(s.website ? { url: s.website.startsWith("http") ? s.website : `https://${s.website}` } : {}),
              },
            })),
          }]
        : []),
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
          <Link href="/directory#cities" className="hover:text-accent">Cities</Link> /{" "}
          <Link href={`/clothes-shops/${c.slug}`} className="hover:text-accent">{c.name}</Link> /{" "}
          <span className="text-ink">{t.label}</span>
        </nav>
        <Kicker className="text-accent mb-4 block">{t.label} · {c.name}</Kicker>
        <h1 className="font-display font-bold uppercase tracking-[-0.02em] leading-[0.92] text-[clamp(2.2rem,5.5vw,4.25rem)] mb-5">
          {t.headingLead}<br /><span className="text-accent">{c.name}</span>
        </h1>
        <p className="text-[1.0625rem] text-muted leading-relaxed mb-6 max-w-xl">{t.intro(c.name)}</p>
        <Link
          href={`/search?q=${encodeURIComponent(t.searches[0])}`}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-bold uppercase tracking-wide px-6 py-3.5 rounded-xl text-sm transition-colors"
        >
          Search near you →
        </Link>
      </Section>

      <Container size="default" className="py-12 space-y-12">
        {/* Shops */}
        <section>
          <Kicker index={1} className="text-faint mb-4 block">
            {shown.length > 0 ? `${shown.length} shops · ${c.name} centre` : `${t.label} in ${c.name}`}
          </Kicker>
          {failed || shown.length === 0 ? (
            <p className="text-sm text-faint leading-relaxed">
              We couldn&apos;t load the shop list right now. Please{" "}
              <Link href="/search" className="text-ink underline underline-offset-2">open the live search</Link>{" "}
              to find {t.label.toLowerCase()} near you.
            </p>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {shown.map((s) => (
                <li key={s.id} className="rounded-xl border-2 border-ink bg-surface p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-ink leading-tight">{s.name}</span>
                    <span className="shrink-0 text-[9px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full bg-panel text-muted border border-line">
                      {typeLabel(s.shopType)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-faint leading-snug">{s.address}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* How it works */}
        <section className="max-w-2xl">
          <Kicker index={2} className="text-faint mb-3 block">How it works</Kicker>
          <p className="text-sm text-muted leading-relaxed">{t.blurb(c.name)}</p>
        </section>

        {/* Try these searches */}
        <section className="bg-ink text-white rounded-2xl p-6 sm:p-7">
          <Kicker className="text-accent mb-3 block">Try these searches</Kicker>
          <div className="flex flex-wrap gap-2">
            {t.searches.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="text-sm font-medium text-white hover:text-ink bg-white/10 hover:bg-white border border-white/20 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </section>

        {/* Related brands */}
        {relatedBrands.length > 0 && (
          <section>
            <Kicker index={3} className="text-faint mb-4 block">Related brands</Kicker>
            <div className="flex flex-wrap gap-2">
              {relatedBrands.map((b) => (
                <Link key={b.slug} href={`/brand/${b.slug}`} className="text-sm font-medium text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">
                  {b.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* More categories in this city */}
        <section className="pt-8 border-t-2 border-ink">
          <Kicker index={4} className="text-faint mb-4 block">More in {c.name}</Kicker>
          <div className="flex flex-wrap gap-2 mb-10">
            <Link href={`/clothes-shops/${c.slug}`} className="text-sm font-medium text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">
              All clothing shops
            </Link>
            {otherTopics.map((x) => (
              <Link key={x.slug} href={`/clothes-shops/${c.slug}/${x.slug}`} className="text-sm font-medium text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">
                {x.label}
              </Link>
            ))}
          </div>

          {/* Same topic, other cities */}
          <Kicker className="text-faint mb-4 block">{t.label} in other cities</Kicker>
          <div className="flex flex-wrap gap-2">
            {otherCities.map((x) => (
              <Link key={x.slug} href={`/clothes-shops/${x.slug}/${t.slug}`} className="text-sm font-medium text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">
                {x.name}
              </Link>
            ))}
          </div>
        </section>
      </Container>

      <PageFooter />
    </div>
  );
}
