import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { PageHeader, PageFooter } from "@/components/SiteChrome";
import { Container, Section, Kicker } from "@/components/Layout";

export const metadata: Metadata = {
  title: "Guides — shopping for clothes locally",
  description:
    "Practical guides to finding clothing brands, trainers, vintage and winter wear in local shops near you in the UK.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Pinpoint guides",
    itemListElement: GUIDES.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `/guides/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader />

      {/* Editorial hero */}
      <Section band="panel" className="border-b-2 border-ink pt-8 pb-10">
        <Kicker className="text-accent mb-4 block">The reading list</Kicker>
        <h1 className="font-display font-bold uppercase tracking-[-0.02em] leading-[0.9] text-[clamp(2.6rem,7vw,5rem)] mb-5">
          Guides
        </h1>
        <p className="text-[1.0625rem] text-muted leading-relaxed max-w-xl">
          Practical advice for finding the clothes and brands you want in local shops — from trainers and boots to
          vintage and winter wear.
        </p>
      </Section>

      <Container size="default" className="py-12">
        <div className="grid sm:grid-cols-2 border-t-2 border-l-2 border-ink">
          {GUIDES.map((g, i) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group border-r-2 border-b-2 border-ink p-6 sm:p-7 hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <Kicker className="text-faint group-hover:text-white/70">Guide</Kicker>
                <span className="font-display font-bold text-3xl text-line group-hover:text-white/30">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h2 className="font-display text-lg font-bold tracking-tight text-ink group-hover:text-on-accent mb-1.5 leading-snug">{g.title}</h2>
              <p className="text-sm text-muted group-hover:text-white/80 leading-relaxed">{g.description}</p>
            </Link>
          ))}
        </div>
      </Container>

      <PageFooter />
    </div>
  );
}
