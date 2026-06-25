// Resolves a clothing/fashion search into (a) OSM shop=* types and (b) brand
// names to match against OSM brand=* tags. OpenStreetMap has no product
// inventory, so results mean "nearby shops likely to sell this brand/type",
// not confirmed stock.

import type { ResolvedQuery } from "./overpass";

// ---- Clothing item categories -------------------------------------------------
// Same shape as before: keyword patterns → OSM shop types.
const ITEM_MAP: Array<{ patterns: RegExp; tags: string[] }> = [
  // Footwear
  { patterns: /\b(trainers?|sneakers?|kicks|runners?|plimsolls?)\b/i, tags: ["shoes", "sports"] },
  // Popular sneaker model names → footwear, so "Adidas Sambas" or "Nike Air Max"
  // search shoe/sports shops rather than every clothing shop. (Bare model
  // numbers like "550" are intentionally excluded — they clash with jeans, e.g.
  // "Levi's 550".)
  { patterns: /\b(sambas?|gazelles?|superstars?|stan smiths?|forums?|spezials?|handballs?|campus|ultraboosts?|nmd|yeezys?|air ?max|air ?force|af1|air ?miler|dunks?|jordans?|blazers?|cortez|pegasus|vapormax|huaraches?|prestos?)\b/i, tags: ["shoes", "sports"] },
  { patterns: /\b(shoes?|boots?|heels?|sandals?|loafers?|brogues?|flats?|footwear|pumps?)\b/i, tags: ["shoes"] },
  { patterns: /\b(football boots?|astro|cleats?|studs?)\b/i, tags: ["sports", "shoes"] },

  // Tops
  { patterns: /\b(t.?shirts?|tee|tees|top|tops|vest|tank)\b/i, tags: ["clothes"] },
  { patterns: /\b(shirt|blouse|polo)\b/i, tags: ["clothes"] },
  { patterns: /\b(hoodie|hoody|sweatshirt|jumper|sweater|knit|cardigan|fleece)\b/i, tags: ["clothes"] },

  // Bottoms
  { patterns: /\b(jeans?|denim)\b/i, tags: ["clothes"] },
  { patterns: /\b(trousers?|pants?|chinos?|joggers?|sweatpants|cargos?|slacks)\b/i, tags: ["clothes"] },
  { patterns: /\b(shorts?|leggings?|tights)\b/i, tags: ["clothes"] },
  { patterns: /\b(skirt|skort)\b/i, tags: ["clothes"] },

  // Dresses & formal
  { patterns: /\b(dress|dresses|gown|frock)\b/i, tags: ["clothes"] },
  { patterns: /\b(suit|tuxedo|blazer|formal|office wear|waistcoat)\b/i, tags: ["clothes", "tailor"] },

  // Outerwear
  { patterns: /\b(jacket|coat|parka|puffer|gilet|bomber|windbreaker|raincoat|mac|anorak|overcoat)\b/i, tags: ["clothes"] },

  // Activewear
  { patterns: /\b(activewear|gym wear|sportswear|gymwear|yoga|workout|running|cycling kit|tracksuit|sports? bra)\b/i, tags: ["sports", "clothes", "shoes"] },

  // Underwear / sleep / swim
  { patterns: /\b(underwear|boxers?|briefs?|lingerie|bra|socks?|sleepwear|pyjamas?|pajamas?|swimwear|swimsuit|bikini|trunks)\b/i, tags: ["clothes"] },

  // Accessories
  { patterns: /\b(hat|cap|beanie|scarf|gloves?|belt|tie|accessor(?:y|ies)|sunglasses)\b/i, tags: ["clothes", "fashion_accessories", "accessories"] },
  { patterns: /\b(bag|handbag|purse|tote|backpack|rucksack|holdall|wallet)\b/i, tags: ["bag", "clothes", "fashion_accessories"] },
  { patterns: /\b(jewellery|jewelry|ring|necklace|bracelet|earrings?|watch|watches)\b/i, tags: ["jewelry", "watches"] },

  // Vintage / pre-owned / kids
  { patterns: /\b(vintage|retro|second.?hand|thrift|pre.?owned|preloved|used|charity)\b/i, tags: ["second_hand", "charity", "clothes"] },
  { patterns: /\b(kids?|childrens?|baby|toddler|boys?|girls?)\b/i, tags: ["clothes", "baby_goods"] },

  // Generic
  { patterns: /\b(clothes|clothing|outfit|garment|wardrobe|apparel|fashion|streetwear|menswear|womenswear)\b/i, tags: ["clothes", "boutique", "fashion_accessories"] },
];

// ---- Brands -------------------------------------------------------------------
// Each entry: keyword pattern → the OSM brand= value to match (case-insensitive,
// substring) + the shop types that brand typically sits in, so multi-brand
// retailers (which won't carry that brand= tag) are also surfaced.
const BRAND_MAP: Array<{ patterns: RegExp; brand: string; shopTypes: string[] }> = [
  // Sportswear & footwear brands
  { patterns: /\bnike\b/i, brand: "Nike", shopTypes: ["shoes", "sports", "clothes"] },
  { patterns: /\b(jordan|air jordan)\b/i, brand: "Jordan", shopTypes: ["shoes", "sports", "clothes"] },
  { patterns: /\badidas\b/i, brand: "Adidas", shopTypes: ["shoes", "sports", "clothes"] },
  { patterns: /\bpuma\b/i, brand: "Puma", shopTypes: ["shoes", "sports", "clothes"] },
  { patterns: /\b(new balance|nb)\b/i, brand: "New Balance", shopTypes: ["shoes", "sports"] },
  { patterns: /\breebok\b/i, brand: "Reebok", shopTypes: ["shoes", "sports", "clothes"] },
  { patterns: /\basics\b/i, brand: "ASICS", shopTypes: ["shoes", "sports"] },
  { patterns: /\bconverse\b/i, brand: "Converse", shopTypes: ["shoes", "clothes"] },
  { patterns: /\bvans\b/i, brand: "Vans", shopTypes: ["shoes", "clothes"] },
  { patterns: /\b(under armour|under armor)\b/i, brand: "Under Armour", shopTypes: ["sports", "clothes", "shoes"] },
  { patterns: /\bgymshark\b/i, brand: "Gymshark", shopTypes: ["sports", "clothes"] },

  // Outdoor
  { patterns: /\b(north face|tnf)\b/i, brand: "The North Face", shopTypes: ["outdoor", "clothes", "shoes"] },
  { patterns: /\bpatagonia\b/i, brand: "Patagonia", shopTypes: ["outdoor", "clothes"] },
  { patterns: /\b(berghaus|rab|montane|jack wolfskin)\b/i, brand: "", shopTypes: ["outdoor", "clothes"] },
  { patterns: /\bcolumbia\b/i, brand: "Columbia", shopTypes: ["outdoor", "clothes"] },

  // Denim / casual
  { patterns: /\b(levi'?s?|levis)\b/i, brand: "Levi's", shopTypes: ["clothes"] },
  { patterns: /\bwrangler\b/i, brand: "Wrangler", shopTypes: ["clothes"] },
  { patterns: /\bcarhartt\b/i, brand: "Carhartt", shopTypes: ["clothes"] },
  { patterns: /\bdickies\b/i, brand: "Dickies", shopTypes: ["clothes"] },

  // High-street fashion
  { patterns: /\bzara\b/i, brand: "Zara", shopTypes: ["clothes"] },
  { patterns: /\bh&?m\b/i, brand: "H&M", shopTypes: ["clothes"] },
  { patterns: /\buniqlo\b/i, brand: "Uniqlo", shopTypes: ["clothes"] },
  { patterns: /\bprimark\b/i, brand: "Primark", shopTypes: ["clothes"] },
  { patterns: /\bnext\b/i, brand: "Next", shopTypes: ["clothes"] },
  { patterns: /\b(marks ?(and|&) ?spencer|m&?s)\b/i, brand: "Marks & Spencer", shopTypes: ["clothes"] },
  { patterns: /\b(topshop|topman)\b/i, brand: "Topshop", shopTypes: ["clothes"] },
  { patterns: /\b(river island)\b/i, brand: "River Island", shopTypes: ["clothes"] },
  { patterns: /\b(new look)\b/i, brand: "New Look", shopTypes: ["clothes"] },

  // Footwear specialists / boots
  { patterns: /\b(dr\.? ?martens|doc martens|docs)\b/i, brand: "Dr. Martens", shopTypes: ["shoes"] },
  { patterns: /\bclarks\b/i, brand: "Clarks", shopTypes: ["shoes"] },
  { patterns: /\btimberland\b/i, brand: "Timberland", shopTypes: ["shoes", "clothes"] },
  { patterns: /\bugg\b/i, brand: "UGG", shopTypes: ["shoes"] },

  // Streetwear / premium
  { patterns: /\bstone island\b/i, brand: "Stone Island", shopTypes: ["clothes", "boutique"] },
  { patterns: /\b(ralph lauren|polo ralph)\b/i, brand: "Ralph Lauren", shopTypes: ["clothes", "boutique"] },
  { patterns: /\b(tommy hilfiger|tommy)\b/i, brand: "Tommy Hilfiger", shopTypes: ["clothes"] },
  { patterns: /\blacoste\b/i, brand: "Lacoste", shopTypes: ["clothes"] },
  { patterns: /\b(st(?:u|ü)ssy)\b/i, brand: "Stüssy", shopTypes: ["clothes", "boutique"] },
  { patterns: /\bsupreme\b/i, brand: "Supreme", shopTypes: ["clothes", "boutique"] },
  { patterns: /\b(calvin klein|ck)\b/i, brand: "Calvin Klein", shopTypes: ["clothes"] },
  { patterns: /\b(hugo boss|boss)\b/i, brand: "Hugo Boss", shopTypes: ["clothes", "boutique"] },
  { patterns: /\bbarbour\b/i, brand: "Barbour", shopTypes: ["clothes"] },
  { patterns: /\bsuperdry\b/i, brand: "Superdry", shopTypes: ["clothes"] },
  { patterns: /\b(fred perry)\b/i, brand: "Fred Perry", shopTypes: ["clothes"] },
  { patterns: /\bchampion\b/i, brand: "Champion", shopTypes: ["clothes"] },
  { patterns: /\bellesse\b/i, brand: "Ellesse", shopTypes: ["clothes", "sports"] },
  { patterns: /\bfila\b/i, brand: "Fila", shopTypes: ["clothes", "sports", "shoes"] },
  { patterns: /\bdiesel\b/i, brand: "Diesel", shopTypes: ["clothes"] },
  { patterns: /\bcrocs\b/i, brand: "Crocs", shopTypes: ["shoes"] },
  { patterns: /\bbirkenstock\b/i, brand: "Birkenstock", shopTypes: ["shoes"] },
  { patterns: /\bskechers\b/i, brand: "Skechers", shopTypes: ["shoes", "sports"] },

  // Multi-brand retailers (the brand= value is the retailer itself)
  { patterns: /\b(jd sports|jd)\b/i, brand: "JD Sports", shopTypes: ["shoes", "sports", "clothes"] },
  { patterns: /\b(sports ?direct)\b/i, brand: "Sports Direct", shopTypes: ["sports", "shoes", "clothes"] },
  { patterns: /\b(foot ?locker)\b/i, brand: "Foot Locker", shopTypes: ["shoes", "sports"] },
  { patterns: /\bsize\?/i, brand: "size?", shopTypes: ["shoes", "clothes"] },
  { patterns: /\bschuh\b/i, brand: "Schuh", shopTypes: ["shoes"] },
  { patterns: /\boffice\b/i, brand: "Office", shopTypes: ["shoes"] },
  { patterns: /\b(tk ?maxx)\b/i, brand: "TK Maxx", shopTypes: ["clothes", "shoes"] },
  { patterns: /\bflannels\b/i, brand: "Flannels", shopTypes: ["clothes", "boutique"] },
  { patterns: /\b(selfridges|harvey nichols|harrods)\b/i, brand: "", shopTypes: ["department_store", "boutique", "clothes"] },
];

// Default clothing shop types when a query matches nothing specific.
const FALLBACK_TYPES = ["clothes", "shoes", "boutique", "fashion_accessories"];

export function resolveQuery(query: string): ResolvedQuery {
  const itemTypes = new Set<string>();
  const brandTypes = new Set<string>();
  const brands = new Set<string>();
  let itemMatched = false;
  let brandMatched = false;

  for (const { patterns, tags } of ITEM_MAP) {
    if (patterns.test(query)) {
      itemMatched = true;
      tags.forEach((t) => itemTypes.add(t));
    }
  }

  for (const { patterns, brand, shopTypes } of BRAND_MAP) {
    if (patterns.test(query)) {
      brandMatched = true;
      if (brand) brands.add(brand);
      shopTypes.forEach((t) => brandTypes.add(t));
    }
  }

  // The named item constrains the shop types: "Nike trainers" should look in
  // shoe/sportswear shops, NOT every clothes shop (Nike is a clothing brand too,
  // which otherwise pulled in dress/lingerie shops). Only fall back to the
  // brand's broad categories when no specific item was named (e.g. just "Nike").
  // With no match at all, default to general clothing shops; queryNearbyShops
  // also name-searches the raw term in that case (to catch unknown brands).
  let shopTypes: Set<string>;
  if (itemMatched) shopTypes = itemTypes;
  else if (brandMatched) shopTypes = brandTypes;
  else shopTypes = new Set(FALLBACK_TYPES);

  return {
    shopTypes: Array.from(shopTypes),
    brands: Array.from(brands),
    matched: itemMatched || brandMatched,
  };
}
