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
  { patterns: /\b(underwear|boxers?|briefs?|lingerie|bra|socks?|sleepwear|pyjamas?|pajamas?|swimwear|swimsuit|bikini|trunks|loungewear|nightwear|onesie|dressing gown|robe)\b/i, tags: ["clothes"] },

  // Other garments
  { patterns: /\b(jersey|kit|base ?layer|crop top|bodysuit|camisole|bralette|tank top)\b/i, tags: ["clothes"] },
  { patterns: /\b(dungarees|overalls|jumpsuit|playsuit|romper|culottes)\b/i, tags: ["clothes"] },
  { patterns: /\b(costume|fancy dress|kimono|sari|saree|hijab|abaya|kilt|poncho|cape|cagoule|shacket|body ?warmer)\b/i, tags: ["clothes"] },
  { patterns: /\b(maternity|plus size|petite|workwear|uniform)\b/i, tags: ["clothes"] },

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
// `retailer: true` marks chains you visit as a shop (JD Sports, Zara, Primark…).
// Searching one of those means "find that store", not "shops that stock it", so
// we restrict those searches to the chain itself (by brand= and name) rather
// than every nearby clothing shop.
const BRAND_MAP: Array<{ patterns: RegExp; brand: string; shopTypes: string[]; retailer?: boolean }> = [
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

  // High-street fashion (own-store chains — visited as a shop)
  { patterns: /\bzara\b/i, brand: "Zara", shopTypes: ["clothes"], retailer: true },
  { patterns: /\bh&?m\b/i, brand: "H&M", shopTypes: ["clothes"], retailer: true },
  { patterns: /\buniqlo\b/i, brand: "Uniqlo", shopTypes: ["clothes"], retailer: true },
  { patterns: /\bprimark\b/i, brand: "Primark", shopTypes: ["clothes"], retailer: true },
  { patterns: /\bnext\b/i, brand: "Next", shopTypes: ["clothes"], retailer: true },
  { patterns: /\b(marks ?(and|&) ?spencer|m&?s)\b/i, brand: "Marks & Spencer", shopTypes: ["clothes"], retailer: true },
  { patterns: /\b(topshop|topman)\b/i, brand: "Topshop", shopTypes: ["clothes"], retailer: true },
  { patterns: /\b(river island)\b/i, brand: "River Island", shopTypes: ["clothes"], retailer: true },
  { patterns: /\b(new look)\b/i, brand: "New Look", shopTypes: ["clothes"], retailer: true },

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
  { patterns: /\bsuperdry\b/i, brand: "Superdry", shopTypes: ["clothes"], retailer: true },
  { patterns: /\b(fred perry)\b/i, brand: "Fred Perry", shopTypes: ["clothes"] },
  { patterns: /\bchampion\b/i, brand: "Champion", shopTypes: ["clothes"] },
  { patterns: /\bellesse\b/i, brand: "Ellesse", shopTypes: ["clothes", "sports"] },
  { patterns: /\bfila\b/i, brand: "Fila", shopTypes: ["clothes", "sports", "shoes"] },
  { patterns: /\bdiesel\b/i, brand: "Diesel", shopTypes: ["clothes"] },
  { patterns: /\bcrocs\b/i, brand: "Crocs", shopTypes: ["shoes"] },
  { patterns: /\bbirkenstock\b/i, brand: "Birkenstock", shopTypes: ["shoes"] },
  { patterns: /\bskechers\b/i, brand: "Skechers", shopTypes: ["shoes", "sports"] },

  // Multi-brand retailers (the brand= value is the retailer itself)
  { patterns: /\b(jd sports|jd)\b/i, brand: "JD Sports", shopTypes: ["shoes", "sports", "clothes"], retailer: true },
  { patterns: /\b(sports ?direct)\b/i, brand: "Sports Direct", shopTypes: ["sports", "shoes", "clothes"], retailer: true },
  { patterns: /\b(foot ?locker)\b/i, brand: "Foot Locker", shopTypes: ["shoes", "sports"], retailer: true },
  { patterns: /\bsize\?/i, brand: "size?", shopTypes: ["shoes", "clothes"], retailer: true },
  { patterns: /\bschuh\b/i, brand: "Schuh", shopTypes: ["shoes"], retailer: true },
  { patterns: /\boffice\b/i, brand: "Office", shopTypes: ["shoes"], retailer: true },
  { patterns: /\b(tk ?maxx)\b/i, brand: "TK Maxx", shopTypes: ["clothes", "shoes"], retailer: true },
  { patterns: /\bflannels\b/i, brand: "Flannels", shopTypes: ["clothes", "boutique"], retailer: true },
  { patterns: /\b(selfridges|harvey nichols|harrods)\b/i, brand: "", shopTypes: ["department_store", "boutique", "clothes"], retailer: true },
  { patterns: /\bdecathlon\b/i, brand: "Decathlon", shopTypes: ["sports", "shoes"], retailer: true },
  { patterns: /\bfootasylum\b/i, brand: "Footasylum", shopTypes: ["shoes", "sports"], retailer: true },
  { patterns: /\bdeichmann\b/i, brand: "Deichmann", shopTypes: ["shoes"], retailer: true },
  { patterns: /\b(shoe ?zone)\b/i, brand: "Shoe Zone", shopTypes: ["shoes"], retailer: true },
  { patterns: /\bmatalan\b/i, brand: "Matalan", shopTypes: ["clothes"], retailer: true },
  { patterns: /\bpeacocks\b/i, brand: "Peacocks", shopTypes: ["clothes"], retailer: true },
  { patterns: /\bburton\b/i, brand: "Burton", shopTypes: ["clothes"], retailer: true },
];

// Clearly non-clothing searches. Pinpoint only covers fashion, so when a query
// matches none of the clothing items/brands above but does hit this list, we
// reject it (no results + a "clothing only" message) rather than returning
// random nearby clothing shops.
const NON_CLOTHING = /\b(poster|posters|print|prints|painting|frame|phone|iphone|smartphone|samsung|laptop|computer|pc|macbook|tablet|ipad|tv|television|monitor|camera|headphones?|earbuds?|airpods?|console|playstation|xbox|nintendo|charger|cable|battery|electronics?|fridge|freezer|microwave|kettle|toaster|appliance|furniture|sofa|couch|desk|mattress|lamp|curtains?|food|pizza|burger|sandwich|coffee|milk|bread|cake|chocolate|sweets?|candy|wine|beer|alcohol|spirits?|grocer(?:y|ies)|fruit|vegetables?|meat|takeaway|restaurant|books?|novel|magazine|comic|pencil|notebook|stationery|guitar|piano|drums?|violin|trumpet|vinyl|records?|cd|dvd|tools?|drill|hammer|screwdriver|nails?|screws?|timber|hardware|diy|plants?|flowers?|garden|seeds?|soil|compost|\bpet\b|puppy|kitten|toy|toys|lego|puzzle|jigsaw|medicine|pharmacy|vitamins?|prescription|makeup|cosmetics?|lipstick|mascara|perfume|cologne|shampoo|cars?|tyres?|motorbike|scooter|football|basketball|cricket bat|dumbbell|kettlebell|treadmill|bicycle|bike)\b/i;

export function resolveQuery(query: string): ResolvedQuery {
  const itemTypes = new Set<string>();
  const brandTypes = new Set<string>();
  const brands = new Set<string>();
  const matchedBrandEntries: typeof BRAND_MAP = [];
  let itemMatched = false;

  for (const { patterns, tags } of ITEM_MAP) {
    if (patterns.test(query)) {
      itemMatched = true;
      tags.forEach((t) => itemTypes.add(t));
    }
  }

  for (const entry of BRAND_MAP) {
    if (entry.patterns.test(query)) {
      matchedBrandEntries.push(entry);
      if (entry.brand) brands.add(entry.brand);
      entry.shopTypes.forEach((t) => brandTypes.add(t));
    }
  }
  const brandMatched = matchedBrandEntries.length > 0;

  // A "retailer" search (e.g. "JD Sports", "Primark") means find that store —
  // you don't buy JD Sports *at* another shop. When the whole query is one or
  // more retailers (and no specific item), restrict to those chains by brand=
  // and name, instead of returning every nearby clothing shop.
  const retailerOnly = brandMatched && !itemMatched && matchedBrandEntries.every((e) => e.retailer);

  if (retailerOnly) {
    const nameMatch = matchedBrandEntries.find((e) => e.brand)?.brand ?? query.trim();
    return { shopTypes: [], brands: Array.from(brands), matched: true, nameMatch };
  }

  // Nothing recognised as clothing.
  if (!itemMatched && !brandMatched) {
    // A clearly non-clothing search ("poster", "laptop", "pizza") → reject.
    if (NON_CLOTHING.test(query)) {
      return { shopTypes: [], brands: [], matched: false, nameMatch: null, rejected: true };
    }
    // Unknown but plausibly clothing (e.g. an unknown brand like "Gucci") —
    // match by shop name only, scoped to clothing shops in buildQuery, so
    // random words don't return every nearby clothing shop.
    return { shopTypes: [], brands: [], matched: false, nameMatch: query.trim() };
  }

  // The named item constrains the shop types ("Nike trainers" → shoe/sportswear
  // shops, not every clothes shop). Only use the brand's broad categories when
  // no specific item was named (e.g. just "Nike").
  const shopTypes = itemMatched ? itemTypes : brandTypes;

  return {
    shopTypes: Array.from(shopTypes),
    brands: Array.from(brands),
    matched: true,
    nameMatch: null,
  };
}
