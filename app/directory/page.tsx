import type { Metadata } from "next";
import Link from "next/link";
import { FEATURED_BRANDS } from "@/lib/brands";
import { CITIES } from "@/lib/cities";
import { PageHeader, PageFooter } from "@/components/SiteChrome";
import { Container, Section, Kicker } from "@/components/Layout";

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

      {/* Editorial hero */}
      <Section band="panel" className="border-b-2 border-ink pt-8 pb-10">
        <Kicker className="text-accent mb-4 block">The index</Kicker>
        <h1 className="font-display font-bold uppercase tracking-[-0.02em] leading-[0.9] text-[clamp(2.6rem,7vw,5rem)] mb-5">
          Directory
        </h1>
        <p className="text-[1.0625rem] text-muted leading-relaxed max-w-xl">
          Browse by brand or by city. Each page helps you find nearby shops likely to stock what you&apos;re after — then
          opens the live map to search around you.
        </p>
      </Section>

      <Container size="default" className="py-12 space-y-12">
        <section id="brands" className="scroll-mt-28">
          <Kicker index={1} className="text-faint mb-4 block">Brands · {FEATURED_BRANDS.length}</Kicker>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 border-t border-l border-line">
            {FEATURED_BRANDS.map((b) => (
              <Link key={b.slug} href={`/brand/${b.slug}`} className="border-r border-b border-line px-4 py-3 text-sm font-medium text-ink hover:bg-accent hover:text-on-accent transition-colors">
                {b.name}
              </Link>
            ))}
          </div>
        </section>

        <section id="cities" className="scroll-mt-28">
          <Kicker index={2} className="text-faint mb-4 block">Clothing shops by city · {CITIES.length}</Kicker>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 border-t border-l border-line">
            {CITIES.map((c) => (
              <Link key={c.slug} href={`/clothes-shops/${c.slug}`} className="border-r border-b border-line px-4 py-3 text-sm font-medium text-ink hover:bg-accent hover:text-on-accent transition-colors">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </Container>

      <PageFooter />
    </div>
  );
}
