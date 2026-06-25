// Long-form guide content for /guides/<slug>. Plain data so the article page
// renders consistently; internal links are driven by relatedBrands/relatedCities
// and the example searches, which deep-link into the live app.

export interface GuideSection {
  heading: string;
  paras: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: GuideSection[];
  searches: string[];
  relatedBrands: string[];
  relatedCities: string[];
  updated: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-find-clothing-brands-near-you",
    title: "How to find any clothing brand near you",
    description:
      "A simple guide to tracking down clothing brands in local shops instead of buying online — search by brand or item and see what's nearby.",
    intro:
      "Buying clothes online is convenient, but it comes with downsides: delivery waits, the hassle of returns, and never quite knowing how something fits until it arrives. Often the brand you want is sitting on a shelf a few minutes away — you just don't know which shop has it. Here's how to find it.",
    sections: [
      {
        heading: "Search the brand, not the shop",
        paras: [
          "The quickest way to find a brand locally is to search for the brand by name. Pinpoint maps a brand to its own stores plus the kinds of shops that typically carry it — so a search for Nike surfaces Nike stores and nearby trainer and sportswear retailers, while a search for Levi's surfaces denim and clothing shops.",
          "If you're after a specific piece, search the item instead — \"denim jacket\", \"winter coat\", \"running trainers\" — and you'll see the clothing, footwear and boutique shops near you that fit the bill.",
        ],
      },
      {
        heading: "Why local often beats online for clothes",
        paras: [
          "You can try things on, so fit and fabric are never a gamble. You walk out with the item the same day — no delivery window, no missed parcels. And buying on your local high street supports independent shops and cuts the packaging and return-trip emissions that come with online orders.",
        ],
      },
      {
        heading: "Tips for getting the best results",
        paras: [
          "Use a brand name where you can — it's the most precise search. Widen the radius if you're in a smaller town, since coverage is thinner outside city centres. And because shop data is community-sourced and doesn't track live stock, it's always worth a quick call ahead before a special trip.",
        ],
      },
    ],
    searches: ["Nike trainers", "Levi's jeans", "denim jacket", "winter coat"],
    relatedBrands: ["nike", "adidas", "levis", "the-north-face"],
    relatedCities: ["london", "manchester", "birmingham"],
    updated: "2026-06-25",
  },
  {
    slug: "where-to-buy-trainers-uk",
    title: "Where to buy trainers in the UK: the sneaker shopping guide",
    description:
      "From Nike and adidas to New Balance, plus multi-brand retailers like JD Sports and size? — how to find trainers near you in the UK.",
    intro:
      "Trainers are one of the most-searched things to buy locally — partly because fit varies so much between brands and models that trying before you buy really matters. Here's how to track down the pair you want without trekking across town blindly.",
    sections: [
      {
        heading: "The big trainer brands",
        paras: [
          "Nike, adidas, New Balance, Puma, ASICS and Converse dominate UK trainer searches. Each has its own signature models — adidas Sambas and Gazelles, New Balance 550s, Nike Air Max and Air Force 1s — and searching the exact model name will point you at footwear and sportswear shops near you.",
        ],
      },
      {
        heading: "Multi-brand sneaker retailers",
        paras: [
          "If you want choice under one roof, the big sneaker retailers carry many brands at once: JD Sports, size?, Foot Locker, Schuh and Sports Direct. Searching one of these takes you straight to that chain's nearest stores — handy when you'd rather compare a few brands in person.",
        ],
      },
      {
        heading: "Finding a specific model",
        paras: [
          "Search the model, not just the brand — \"Adidas Sambas\", \"New Balance 550\", \"Nike Air Max\" — and Pinpoint focuses on shoe and sportswear shops rather than every clothing shop nearby. Confirmed brand stores are listed first, then nearby stockists sorted by distance.",
        ],
      },
    ],
    searches: ["Nike Air Max", "Adidas Sambas", "New Balance 550", "JD Sports"],
    relatedBrands: ["nike", "adidas", "new-balance", "jd-sports"],
    relatedCities: ["london", "manchester", "glasgow"],
    updated: "2026-06-25",
  },
  {
    slug: "vintage-and-second-hand-clothes-guide",
    title: "Vintage & second-hand clothes: a local shopping guide",
    description:
      "Where to find vintage, charity and second-hand clothing near you in the UK — and why pre-loved is worth it for your wallet and the planet.",
    intro:
      "Second-hand is having a moment — and for good reason. Pre-loved clothing is cheaper, kinder to the environment, and full of one-off pieces you won't find on the high street. The catch is that the best finds are local and unpredictable, so knowing where to look helps.",
    sections: [
      {
        heading: "Where to look",
        paras: [
          "Three kinds of shop cover most second-hand finds: dedicated vintage boutiques, charity shops, and general second-hand stores. Vintage boutiques curate by era and style; charity shops are cheaper and more hit-and-miss but brilliant for a rummage; second-hand stores sit somewhere in between.",
        ],
      },
      {
        heading: "Why buy second-hand",
        paras: [
          "Every pre-loved piece keeps a garment out of landfill and avoids the resources needed to make a new one. You'll also pay a fraction of retail, and you're far more likely to find something genuinely unique — including older runs of brands like Levi's, Carhartt and The North Face that are no longer made.",
        ],
      },
      {
        heading: "Searching for vintage",
        paras: [
          "Search \"vintage\", \"second-hand\" or a brand with \"vintage\" in front, like \"vintage Levi's\". City centres and university towns tend to have the densest cluster of vintage and charity shops, so it's worth browsing a nearby city's page if your town is quiet.",
        ],
      },
    ],
    searches: ["vintage", "vintage Levi's", "second-hand", "charity shop"],
    relatedBrands: ["levis", "carhartt", "the-north-face"],
    relatedCities: ["brighton", "manchester", "bristol", "leeds"],
    updated: "2026-06-25",
  },
  {
    slug: "where-to-buy-boots-uk",
    title: "Where to buy boots in the UK: Dr. Martens, Clarks & more",
    description:
      "A guide to buying boots and shoes locally in the UK — from Dr. Martens and Clarks to Timberland, plus the shoe shops that stock them.",
    intro:
      "Boots are an investment, and fit is everything — which makes them a category really worth buying in person. Whether you're after classic Dr. Martens, a pair of Clarks, or rugged Timberlands, here's how to find them nearby.",
    sections: [
      {
        heading: "The boot brands worth knowing",
        paras: [
          "Dr. Martens make the iconic air-cushioned 1460 boot; Clarks are a British staple known for the Desert Boot; Timberland's yellow boot is a winter mainstay. Each has its own stores in larger towns and cities, and a search by brand will point you to them.",
        ],
      },
      {
        heading: "Shoe shops that carry multiple brands",
        paras: [
          "If you'd rather try a few options side by side, multi-brand shoe retailers like Schuh, Office and Deichmann stock a wide range of boots and shoes. Searching one takes you to that chain's nearest branches.",
        ],
      },
      {
        heading: "Timing your search",
        paras: [
          "Boots sell fastest in autumn and winter, so popular sizes can disappear early in the season. Since shop listings don't track live stock, search a couple of nearby options and call ahead to check your size before heading out.",
        ],
      },
    ],
    searches: ["Dr. Martens", "Clarks", "Timberland boots", "boots"],
    relatedBrands: ["dr-martens", "clarks", "timberland"],
    relatedCities: ["london", "birmingham", "leeds"],
    updated: "2026-06-25",
  },
  {
    slug: "shopping-local-vs-online-clothes",
    title: "Shopping local vs online: why buy clothes in person?",
    description:
      "The case for buying clothes on your local high street instead of online — fit, speed, sustainability — and how to find what you want nearby.",
    intro:
      "Online shopping has become the default for clothes, but it isn't always the best option. Before you add to basket, it's worth knowing what you give up by not shopping in person — and how easy it is to find the same items locally.",
    sections: [
      {
        heading: "What you gain by shopping in person",
        paras: [
          "The obvious one is fit: you can try things on and feel the fabric, so you avoid the guesswork that drives so many online returns. You also get the item immediately — no delivery window, no missed parcels — and you keep money on your local high street.",
          "There's an environmental angle too. Home delivery and the returns that follow add packaging and extra journeys; a significant share of online clothing is sent back, and not all of it gets resold.",
        ],
      },
      {
        heading: "When online still makes sense",
        paras: [
          "Online wins for rare sizes, niche brands with no nearby stockist, and outright convenience when you already know exactly what fits. The smart approach is to combine the two: check what's nearby first, and only order online when local genuinely can't deliver.",
        ],
      },
      {
        heading: "How to find it nearby",
        paras: [
          "Search the brand or item you're after and Pinpoint maps the local shops likely to sell it, sorted by distance. It's the quickest way to see whether a quick trip beats waiting for a parcel.",
        ],
      },
    ],
    searches: ["Nike trainers", "vintage jacket", "jeans", "hoodie"],
    relatedBrands: ["nike", "levis", "carhartt"],
    relatedCities: ["london", "manchester", "edinburgh"],
    updated: "2026-06-25",
  },
  {
    slug: "where-to-buy-winter-jackets-uk",
    title: "Where to buy winter jackets & coats in the UK",
    description:
      "From The North Face and Patagonia to Barbour — a guide to finding winter jackets, puffers and waterproof coats in local shops near you.",
    intro:
      "A good winter jacket is worth getting right, and that usually means trying it on — checking the fit over a jumper, testing the hood, feeling the weight. Here's where to find the warm layer you need without ordering three sizes online to compare.",
    sections: [
      {
        heading: "The brands to know",
        paras: [
          "For technical warmth, The North Face (the Nuptse puffer), Patagonia (the Better Sweater and down jackets) and outdoor specialists like Berghaus lead the way. For a more heritage look, Barbour's waxed jackets are a British classic. Searching any of these points you to their stores and nearby stockists.",
        ],
      },
      {
        heading: "Where they're sold",
        paras: [
          "Outdoor and clothing shops carry most winter jackets, and larger towns often have dedicated brand stores. If you want to compare puffers, fleeces and waterproofs in one trip, browsing a nearby city centre is usually your best bet.",
        ],
      },
      {
        heading: "What to look for",
        paras: [
          "Think about insulation (down is warmest for the weight; synthetic handles damp better), whether you need a waterproof shell, and the fit over your usual layers. Trying it on in person is the only reliable way to judge all three.",
        ],
      },
    ],
    searches: ["North Face jacket", "Patagonia fleece", "Barbour jacket", "puffer"],
    relatedBrands: ["the-north-face", "patagonia", "barbour"],
    relatedCities: ["manchester", "edinburgh", "leeds"],
    updated: "2026-06-25",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
