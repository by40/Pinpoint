// UK cities/towns that get a /clothes-shops/<slug> SEO page. Coordinates are the
// approximate city/town centre (main shopping area), used to query nearby
// clothing shops server-side — no user geolocation required.

export interface City {
  name: string;
  slug: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { name: "London", slug: "london", lat: 51.5142, lon: -0.1494 },
  { name: "Manchester", slug: "manchester", lat: 53.4808, lon: -2.2426 },
  { name: "Birmingham", slug: "birmingham", lat: 52.4796, lon: -1.9026 },
  { name: "Leeds", slug: "leeds", lat: 53.7965, lon: -1.5478 },
  { name: "Liverpool", slug: "liverpool", lat: 53.4055, lon: -2.9799 },
  { name: "Glasgow", slug: "glasgow", lat: 55.8609, lon: -4.2514 },
  { name: "Edinburgh", slug: "edinburgh", lat: 55.9509, lon: -3.1898 },
  { name: "Bristol", slug: "bristol", lat: 51.4536, lon: -2.5975 },
  { name: "Sheffield", slug: "sheffield", lat: 53.3808, lon: -1.4703 },
  { name: "Newcastle", slug: "newcastle", lat: 54.9738, lon: -1.6131 },
  { name: "Nottingham", slug: "nottingham", lat: 52.9536, lon: -1.1505 },
  { name: "Cardiff", slug: "cardiff", lat: 51.4815, lon: -3.1791 },
  { name: "Brighton", slug: "brighton", lat: 50.8214, lon: -0.1401 },
  { name: "Leicester", slug: "leicester", lat: 52.6347, lon: -1.1326 },
  { name: "Cambridge", slug: "cambridge", lat: 52.2053, lon: 0.1218 },
  { name: "Oxford", slug: "oxford", lat: 51.7520, lon: -1.2577 },
  { name: "Bath", slug: "bath", lat: 51.3811, lon: -2.3590 },
  { name: "York", slug: "york", lat: 53.9590, lon: -1.0815 },
  { name: "Belfast", slug: "belfast", lat: 54.5973, lon: -5.9301 },
  { name: "Southampton", slug: "southampton", lat: 50.9097, lon: -1.4044 },
  { name: "Coventry", slug: "coventry", lat: 52.4068, lon: -1.5197 },
  { name: "Hull", slug: "hull", lat: 53.7443, lon: -0.3325 },
  { name: "Stoke-on-Trent", slug: "stoke-on-trent", lat: 53.0235, lon: -2.1804 },
  { name: "Derby", slug: "derby", lat: 52.9225, lon: -1.4746 },
  { name: "Wolverhampton", slug: "wolverhampton", lat: 52.5862, lon: -2.1288 },
  { name: "Plymouth", slug: "plymouth", lat: 50.3755, lon: -4.1427 },
  { name: "Reading", slug: "reading", lat: 51.4543, lon: -0.9781 },
  { name: "Norwich", slug: "norwich", lat: 52.6309, lon: 1.2974 },
  { name: "Swansea", slug: "swansea", lat: 51.6214, lon: -3.9436 },
  { name: "Aberdeen", slug: "aberdeen", lat: 57.1497, lon: -2.0943 },
  { name: "Dundee", slug: "dundee", lat: 56.4620, lon: -2.9707 },
  { name: "Exeter", slug: "exeter", lat: 50.7184, lon: -3.5339 },
  { name: "Bournemouth", slug: "bournemouth", lat: 50.7192, lon: -1.8808 },
  { name: "Portsmouth", slug: "portsmouth", lat: 50.7989, lon: -1.0912 },
  { name: "Preston", slug: "preston", lat: 53.7632, lon: -2.7031 },
  { name: "Milton Keynes", slug: "milton-keynes", lat: 52.0406, lon: -0.7594 },
  { name: "Bradford", slug: "bradford", lat: 53.7960, lon: -1.7594 },
];

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
