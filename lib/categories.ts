// Maps user search terms to OSM shop=* tag values.
// Each entry is a list of [keyword patterns, OSM shop types] pairs.

const CATEGORY_MAP: Array<{ patterns: RegExp; tags: string[] }> = [
  // Food & Drink
  { patterns: /\b(coffee|espresso|latte|cappuccino)\b/i, tags: ["coffee", "cafe"] },
  { patterns: /\b(milk|cheese|butter|yogurt|dairy|eggs?|bread|groceries?|grocery|food|snacks?|cereal)\b/i, tags: ["supermarket", "convenience", "farm"] },
  { patterns: /\b(fruit|vegetables?|veg|produce|organic)\b/i, tags: ["greengrocer", "supermarket", "farm"] },
  { patterns: /\b(meat|beef|chicken|pork|lamb|steak|butcher)\b/i, tags: ["butcher", "supermarket"] },
  { patterns: /\b(fish|seafood|sushi|salmon|prawns?)\b/i, tags: ["seafood", "fishmonger", "supermarket"] },
  { patterns: /\b(bread|bakery|croissant|pastry|cake|muffin|doughnut|donut|baked)\b/i, tags: ["bakery"] },
  { patterns: /\b(wine|beer|spirits?|alcohol|whiskey|whisky|gin|vodka|rum|cider|lager|ale)\b/i, tags: ["alcohol", "wine", "off_licence"] },
  { patterns: /\b(chocolate|sweets?|candy|lollies|candy bar)\b/i, tags: ["confectionery", "chocolate", "supermarket"] },
  { patterns: /\b(ice cream|gelato|frozen yogurt)\b/i, tags: ["ice_cream"] },

  // Health & Pharmacy
  { patterns: /\b(medicine|pharmacy|prescription|vitamins?|supplements?|paracetamol|aspirin|ibuprofen|drugs?|medication)\b/i, tags: ["pharmacy", "chemist"] },
  { patterns: /\b(optician|glasses|spectacles|contact lenses?|eyewear)\b/i, tags: ["optician"] },
  { patterns: /\b(health food|protein powder|whey|nutrition)\b/i, tags: ["health_food", "supermarket"] },

  // Music & Entertainment
  { patterns: /\b(guitar|bass|drums?|piano|keyboard|violin|cello|trumpet|saxophone|ukulele|banjo|strings?|picks?|pedal|amp|amplifier)\b/i, tags: ["music"] },
  { patterns: /\b(vinyl|records?|album|cd|dvd|blu.?ray)\b/i, tags: ["music", "second_hand"] },
  { patterns: /\b(games?|gaming|console|playstation|xbox|nintendo|video game)\b/i, tags: ["video_games", "electronics"] },

  // Electronics & Tech
  { patterns: /\b(phone|smartphone|mobile|iphone|android|samsung)\b/i, tags: ["mobile_phone", "electronics"] },
  { patterns: /\b(laptop|computer|pc|mac|tablet|monitor|keyboard|mouse|headphones?|earphones?|earbuds?)\b/i, tags: ["computer", "electronics"] },
  { patterns: /\b(camera|lens|tripod|photography)\b/i, tags: ["camera", "electronics"] },
  { patterns: /\b(tv|television|smart tv|plasma)\b/i, tags: ["electronics"] },
  { patterns: /\b(battery|batteries|charger|cable|usb|adaptor)\b/i, tags: ["electronics", "convenience"] },

  // Clothes & Fashion
  { patterns: /\b(vintage|retro|second.?hand|thrift|pre.?owned|used clothes)\b/i, tags: ["second_hand", "charity", "clothes"] },
  { patterns: /\b(jeans?|denim|trousers?|pants?|shorts?|leggings?)\b/i, tags: ["clothes"] },
  { patterns: /\b(shirt|t.?shirt|hoodie|jacket|coat|jumper|sweater|dress|skirt|blouse)\b/i, tags: ["clothes"] },
  { patterns: /\b(shoes?|trainers?|sneakers?|boots?|heels?|sandals?|footwear)\b/i, tags: ["shoes", "clothes"] },
  { patterns: /\b(hat|cap|beanie|scarf|gloves?|accessories)\b/i, tags: ["clothes", "accessories"] },
  { patterns: /\b(sports? wear|gym wear|activewear|yoga)\b/i, tags: ["sports", "clothes"] },
  { patterns: /\b(suit|formal|office wear)\b/i, tags: ["clothes"] },
  { patterns: /\b(jewellery|jewelry|ring|necklace|bracelet|earrings?|watch|watches)\b/i, tags: ["jewelry", "watches"] },

  // Books & Stationery
  { patterns: /\b(book|novel|fiction|non.?fiction|autobiography|biography|textbook)\b/i, tags: ["books"] },
  { patterns: /\b(pen|pencil|notebook|stationery|paper|ink|printer)\b/i, tags: ["stationery"] },
  { patterns: /\b(art supply|art supplies|paint|canvas|brush|easel|drawing)\b/i, tags: ["art", "stationery"] },

  // Sports & Outdoors
  { patterns: /\b(football|soccer ball|rugby|cricket|tennis|badminton|squash|racket)\b/i, tags: ["sports"] },
  { patterns: /\b(running|cycling|swim|swimming|gym|fitness|weights?|dumbbell|barbell)\b/i, tags: ["sports"] },
  { patterns: /\b(bike|bicycle|cycling)\b/i, tags: ["bicycle", "sports"] },
  { patterns: /\b(camping|hiking|tent|sleeping bag|backpack|outdoor)\b/i, tags: ["outdoor", "sports"] },
  { patterns: /\b(surf|skateboard|snowboard|ski|skiing)\b/i, tags: ["sports"] },

  // Home & DIY
  { patterns: /\b(furniture|sofa|couch|table|chair|bed|wardrobe|shelf|shelves)\b/i, tags: ["furniture"] },
  { patterns: /\b(tool|drill|hammer|screwdriver|saw|nails?|screws?|bolts?|diy)\b/i, tags: ["hardware", "doityourself"] },
  { patterns: /\b(paint|wallpaper|decorating|renovation)\b/i, tags: ["paint", "hardware", "doityourself"] },
  { patterns: /\b(plants?|flowers?|garden|seeds?|pots?|soil|gardening)\b/i, tags: ["florist", "garden_centre"] },
  { patterns: /\b(mattress|bedding|duvet|pillow|sheets?|towels?)\b/i, tags: ["bedding", "furniture"] },

  // Beauty & Personal Care
  { patterns: /\b(haircut|barber|hairdresser|salon)\b/i, tags: ["hairdresser", "barber"] },
  { patterns: /\b(makeup|cosmetics?|foundation|lipstick|mascara|perfume|cologne)\b/i, tags: ["cosmetics", "beauty"] },
  { patterns: /\b(shampoo|conditioner|soap|body wash|deodorant|toothbrush|toothpaste)\b/i, tags: ["chemist", "supermarket"] },

  // Pets
  { patterns: /\b(pet food|dog food|cat food|fish food|bird seed|pet)\b/i, tags: ["pet"] },

  // Toys & Kids
  { patterns: /\b(toy|toys|lego|puzzle|doll|action figure|board game)\b/i, tags: ["toys", "games"] },
  { patterns: /\b(baby|nappy|diaper|pram|pushchair|stroller)\b/i, tags: ["baby_goods", "supermarket"] },

  // General / Variety
  { patterns: /\b(gift|present|card|greeting)\b/i, tags: ["gift", "stationery"] },
  { patterns: /\b(bag|handbag|purse|wallet|luggage|suitcase|backpack)\b/i, tags: ["bag", "accessories", "luggage"] },
  { patterns: /\b(glasses|sunglasses)\b/i, tags: ["optician", "accessories"] },
];

export function getShopTags(query: string): string[] {
  const matched = new Set<string>();

  for (const { patterns, tags } of CATEGORY_MAP) {
    if (patterns.test(query)) {
      tags.forEach((t) => matched.add(t));
    }
  }

  return Array.from(matched);
}
