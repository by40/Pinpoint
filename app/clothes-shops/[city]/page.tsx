import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getCity } from "@/lib/cities";
import { FEATURED_BRANDS } from "@/lib/brands";
import { queryNearbyShops, type Shop } from "@/lib/overpass";
import { PageHeader, PageFooter } from "@/components/SiteChrome";

// Regenerate at most weekly; render on demand (no build-time Overpass storm).
export const revalidate = 604800;

const CLOTHING = {
  shopTypes: ["clothes", "shoes", "boutique", "second_hand", "fashion_accessories", "sports"],
  brands: [],
  matched: true,
  nameMatch: null,
};

function typeLabel(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return {};
  const title = `Clothing shops in ${c.name}`;
  const description = `Discover clothing, shoe and fashion shops in ${c.name}, mapped from community OpenStreetMap data. Search any brand or item to see what's near you.`;
  return {
    title,
    description,
    alternates: { canonical: `/clothes-shops/${c.slug}` },
    openGraph: { title: `${title} · Pinpoint`, description, url: `/clothes-shops/${c.slug}` },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();

  let shops: Shop[] = [];
  let failed = false;
  try {
    shops = await queryNearbyShops(CLOTHING, c.lat, c.lon, 2500);
  } catch {
    failed = true;
  }
  const shown = shops.slice(0, 48);
  const otherCities = CITIES.filter((x) => x.slug !== c.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Clothing shops by city", item: "/directory" },
          { "@type": "ListItem", position: 3, name: c.name, item: `/clothes-shops/${c.slug}` },
        ],
      },
      ...(shown.length
        ? [{
            "@type": "ItemList",
            name: `Clothing shops in ${c.name}`,
            numberOfItems: shown.length,
            itemListElement: shown.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "ClothingStore",
                name: s.name,
                ...(s.address && s.address !== "Address not listed"
                  ? { address: s.address }
                  : {}),
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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <nav className="text-xs text-faint mb-6">
          <Link href="/" className="hover:text-accent">Home</Link> ·{" "}
          <Link href="/directory" className="hover:text-accent">Cities</Link> ·{" "}
          <span className="text-muted">{c.name}</span>
        </nav>

        <h1 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-[1.1] mb-4">
          Clothing shops in {c.name}
        </h1>
        <p className="text-[1.0625rem] text-muted leading-relaxed mb-6 max-w-xl">
          A snapshot of clothing, shoe and fashion shops around {c.name}, from community OpenStreetMap data. Want a
          specific brand or item? Open the live map and search — it&apos;ll find what&apos;s near you and sort by distance.
        </p>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Search clothes near you →
        </Link>

        <section className="mt-10">
          <h2 className="text-base font-bold tracking-tight mb-4">
            {shown.length > 0 ? `${shown.length} shops around ${c.name} centre` : `Shops in ${c.name}`}
          </h2>

          {failed || shown.length === 0 ? (
            <p className="text-sm text-faint leading-relaxed">
              We couldn&apos;t load the shop list right now. Please{" "}
              <Link href="/search" className="text-ink underline underline-offset-2">open the live search</Link>{" "}
              to find clothing shops near you.
            </p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-2">
              {shown.map((s) => (
                <li key={s.id} className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-ink leading-tight">{s.name}</span>
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-panel text-muted border border-line">
                      {typeLabel(s.shopType)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-faint leading-snug">{s.address}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12 pt-8 border-t border-line">
          <h2 className="text-[10px] uppercase tracking-widest text-faint font-medium mb-3">Popular brands</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {FEATURED_BRANDS.slice(0, 10).map((b) => (
              <Link key={b.slug} href={`/brand/${b.slug}`} className="text-sm text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">
                {b.name}
              </Link>
            ))}
          </div>
          <h2 className="text-[10px] uppercase tracking-widest text-faint font-medium mb-3">Other cities</h2>
          <div className="flex flex-wrap gap-2">
            {otherCities.map((x) => (
              <Link key={x.slug} href={`/clothes-shops/${x.slug}`} className="text-sm text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">
                {x.name}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
