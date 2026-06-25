import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { PageHeader, PageFooter } from "@/components/SiteChrome";

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
    <div className="min-h-screen bg-[#F7F6F3] text-[#141412]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-[1.1] mb-4">Guides</h1>
        <p className="text-[1.0625rem] text-[#57554E] leading-relaxed mb-10 max-w-xl">
          Practical advice for finding the clothes and brands you want in local shops — from trainers and boots to
          vintage and winter wear.
        </p>

        <div className="space-y-3">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="block p-5 rounded-2xl border border-[#E3E1DB] bg-white hover:border-[#141412]/25 transition-colors"
            >
              <h2 className="text-base font-bold tracking-tight text-[#141412] mb-1">{g.title}</h2>
              <p className="text-sm text-[#57554E] leading-relaxed">{g.description}</p>
            </Link>
          ))}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
