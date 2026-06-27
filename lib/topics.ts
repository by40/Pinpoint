import type { ResolvedQuery } from "@/lib/overpass";

// Topic landing pages combine a shopping *intent* with a *city* to target
// high-intent long-tail queries ("vintage shops in Manchester", "where to buy
// trainers in Leeds"). Each topic maps to a narrowed OSM shop-type query plus
// unique copy/searches/brands so the pages are genuinely differentiated, not
// thin doorways. Rendered at /clothes-shops/[city]/[topic].
export interface Topic {
  slug: string;
  label: string; // kicker + breadcrumb, e.g. "Vintage"
  /** Big H1 lead; the city is appended on its own line in the accent colour. */
  headingLead: string;
  metaTitle: (city: string) => string;
  metaDescription: (city: string) => string;
  intro: (city: string) => string;
  /** "How Pinpoint finds…" explanatory paragraph. */
  blurb: (city: string) => string;
  /** The Overpass query: narrowed shop types (+ optional name match). */
  query: ResolvedQuery;
  searches: string[];
  /** Brand slugs that exist in FEATURED_BRANDS. */
  relatedBrands: string[];
}

function q(shopTypes: string[], nameMatch: string | null = null): ResolvedQuery {
  return { shopTypes, brands: [], matched: true, nameMatch };
}

export const TOPICS: Topic[] = [
  {
    slug: "trainers",
    label: "Trainers",
    headingLead: "Where to buy trainers in",
    metaTitle: (c) => `Where to buy trainers in ${c}`,
    metaDescription: (c) =>
      `Find shops selling trainers and sneakers in ${c} — Nike, adidas, New Balance and more — mapped from community OpenStreetMap data and sorted by distance.`,
    intro: (c) =>
      `Looking for trainers in ${c}? These are the local shoe shops, sportswear stores and trainer specialists most likely to stock sneakers near the city centre.`,
    blurb: (c) =>
      `Pinpoint looks for shoe and sportswear shops around ${c} that typically carry trainers, using community OpenStreetMap data. Open the live map and search a model (e.g. "Nike Air Force 1") to see what's nearest you and which shops are open.`,
    query: q(["shoes", "sports"]),
    searches: ["Nike Air Force 1", "Adidas Sambas", "New Balance 530", "Jordan 1", "running trainers"],
    relatedBrands: ["nike", "adidas", "new-balance", "converse", "vans"],
  },
  {
    slug: "vintage",
    label: "Vintage",
    headingLead: "Vintage & second-hand shops in",
    metaTitle: (c) => `Vintage & second-hand clothes shops in ${c}`,
    metaDescription: (c) =>
      `Find vintage, second-hand and charity clothing shops in ${c} for retro denim, sportswear and one-off pieces — mapped from community data, sorted by distance.`,
    intro: (c) =>
      `Hunting for vintage in ${c}? These second-hand, charity and retro clothing shops near the centre are your best bets for vintage denim, jackets and sportswear.`,
    blurb: (c) =>
      `Pinpoint maps the second-hand, charity and vintage clothing shops around ${c} from community OpenStreetMap data. Stock turns over fast in vintage shops, so it's always worth a visit or a quick call ahead.`,
    query: q(["second_hand", "charity"], "vintage"),
    searches: ["vintage Levi's", "vintage denim jacket", "retro sportswear", "second-hand coat", "vintage tee"],
    relatedBrands: ["levis", "carhartt", "stussy", "the-north-face"],
  },
  {
    slug: "boots",
    label: "Boots",
    headingLead: "Where to buy boots in",
    metaTitle: (c) => `Where to buy boots in ${c}`,
    metaDescription: (c) =>
      `Find shops selling boots in ${c} — Dr. Martens, Timberland, Chelsea and walking boots — mapped from community OpenStreetMap data and sorted by distance.`,
    intro: (c) =>
      `Need boots in ${c}? These local shoe shops near the centre are the most likely to stock everything from Dr. Martens and Chelsea boots to walking boots.`,
    blurb: (c) =>
      `Pinpoint finds the shoe shops around ${c} that typically carry boots, using community OpenStreetMap data. Search a style or brand (e.g. "Dr. Martens 1460") on the live map to see what's nearest and in which shops.`,
    query: q(["shoes"]),
    searches: ["Dr. Martens 1460", "Timberland boots", "Chelsea boots", "walking boots", "leather boots"],
    relatedBrands: ["dr-martens", "timberland", "clarks"],
  },
  {
    slug: "sportswear",
    label: "Sportswear",
    headingLead: "Sportswear shops in",
    metaTitle: (c) => `Sportswear & activewear shops in ${c}`,
    metaDescription: (c) =>
      `Find sportswear and activewear shops in ${c} — tracksuits, hoodies and gym kit from Nike, adidas and more — mapped from community data, sorted by distance.`,
    intro: (c) =>
      `After sportswear in ${c}? These sports shops and clothing stores near the centre are the most likely to stock tracksuits, hoodies and activewear.`,
    blurb: (c) =>
      `Pinpoint maps the sports and clothing shops around ${c} that typically carry activewear, using community OpenStreetMap data. Search a brand or item (e.g. "Adidas tracksuit") on the live map to see what's near you.`,
    query: q(["sports", "clothes", "shoes"]),
    searches: ["Nike hoodie", "Adidas tracksuit", "gym wear", "running gear", "football shirt"],
    relatedBrands: ["nike", "adidas", "new-balance"],
  },
  {
    slug: "streetwear",
    label: "Streetwear",
    headingLead: "Streetwear shops in",
    metaTitle: (c) => `Streetwear shops in ${c}`,
    metaDescription: (c) =>
      `Find shops in ${c} likely to stock streetwear and skate brands like Carhartt, Stüssy and Dickies — mapped from community data, sorted by distance.`,
    intro: (c) =>
      `Looking for streetwear in ${c}? These clothing shops and boutiques near the centre are the most likely to carry skate and street brands.`,
    blurb: (c) =>
      `Pinpoint maps the clothing shops and boutiques around ${c} that tend to carry streetwear, using community OpenStreetMap data. Search a brand (e.g. "Carhartt WIP") on the live map to see what's nearest you.`,
    query: q(["clothes", "boutique", "fashion_accessories"]),
    searches: ["Carhartt WIP", "Stüssy hoodie", "cargo trousers", "graphic tee", "skate shoes"],
    relatedBrands: ["carhartt", "stussy", "dickies", "vans"],
  },
  {
    slug: "designer",
    label: "Designer",
    headingLead: "Designer & boutique fashion in",
    metaTitle: (c) => `Designer & boutique fashion in ${c}`,
    metaDescription: (c) =>
      `Find designer boutiques and premium fashion shops in ${c} — mapped from community OpenStreetMap data and sorted by distance.`,
    intro: (c) =>
      `After something premium in ${c}? These boutiques near the centre are the most likely to carry designer and higher-end fashion.`,
    blurb: (c) =>
      `Pinpoint maps the boutiques around ${c} from community OpenStreetMap data — the kind of shops that carry designer and premium labels. Always confirm stock with the shop before a journey.`,
    query: q(["boutique"]),
    searches: ["designer jacket", "Ralph Lauren", "Barbour coat", "luxury knitwear", "boutique dress"],
    relatedBrands: ["barbour", "ralph-lauren", "the-north-face"],
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}
