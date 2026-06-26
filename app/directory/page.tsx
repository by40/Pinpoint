import type { Metadata } from "next";
import Link from "next/link";
import { FEATURED_BRANDS } from "@/lib/brands";
import { CITIES } from "@/lib/cities";
import { PageHeader, PageFooter } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Directory — brands & cities",
  description:
    "Browse clothing brands and UK cities covered by Pinpoint. Find where to buy Nike, Adidas, Levi's and more near you, or explore clothing shops by city.",
  alternates: { canonical: "/directory" },
};

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <PageHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-[1.1] mb-4">Directory</h1>
        <p className="text-[1.0625rem] text-muted leading-relaxed mb-10 max-w-xl">
          Browse by brand or by city. Each page helps you find nearby shops likely to stock what you&apos;re after — then
          opens the live map to search around you.
        </p>

        <section className="mb-12">
          <h2 className="text-base font-bold tracking-tight mb-4">Brands</h2>
          <div className="flex flex-wrap gap-2">
            {FEATURED_BRANDS.map((b) => (
              <Link key={b.slug} href={`/brand/${b.slug}`} className="text-sm text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">
                {b.name}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold tracking-tight mb-4">Clothing shops by city</h2>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Link key={c.slug} href={`/clothes-shops/${c.slug}`} className="text-sm text-muted hover:text-accent bg-surface hover:bg-panel border border-line px-3 py-1.5 rounded-full transition-colors">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
