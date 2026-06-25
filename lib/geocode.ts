export interface GeoResult {
  lat: number;
  lon: number;
  label: string;
}

// Resolve a typed place (town or UK postcode) to coordinates via our geocode
// proxy. Used as the fallback when browser geolocation is denied or unavailable.
export async function geocodePlace(place: string): Promise<GeoResult> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(place)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(res.status === 404 ? "We couldn't find that place. Try a town or postcode." : data.error ?? "Location lookup failed.");
  }
  return data as GeoResult;
}
