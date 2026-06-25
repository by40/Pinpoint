"use client";

import { useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import ShopCard from "@/components/ShopCard";
import SoundToggle from "@/components/SoundToggle";
import * as sounds from "@/lib/sounds";
import type { Shop } from "@/lib/overpass";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface SearchState {
  query: string;
  lat: number;
  lon: number;
  shops: Shop[];
}

const EXAMPLE_SEARCHES = ["vinyl records", "guitar strings", "vintage jeans", "organic bread", "camping gear"];

function SearchApp() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchState | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [matchedTags, setMatchedTags] = useState<string[]>([]);
  const [widenedNote, setWidenedNote] = useState<string | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(2);
  // Ref mirror so the stable handleSearch always reads the latest slider value.
  const radiusMilesRef = useRef(2);
  const setMiles = (m: number) => {
    radiusMilesRef.current = m;
    setRadiusMiles(m);
  };

  const fetchShops = async (q: string, lat: number, lon: number, miles: number) => {
    const radiusM = Math.round(miles * 1609.34);
    const res = await fetch(
      `/api/shops?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}&radius=${radiusM}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch shops");
    return data as { shops: Shop[]; tags: string[] };
  };

  const handleSearch = useCallback(async (searchQuery: string, lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    setActiveShopId(null);
    setWidenedNote(null);
    sounds.playStart();
    sounds.startLoadingLoop();

    const baseMiles = radiusMilesRef.current;

    try {
      let data = await fetchShops(searchQuery, lat, lon, baseMiles);

      // Auto-broaden once if nothing turned up and we're not already at the cap —
      // thin OpenStreetMap coverage shouldn't read as "no shops exist".
      if ((data.shops?.length ?? 0) === 0 && baseMiles < 10) {
        const widerMiles = Math.min(baseMiles * 2, 10);
        const wider = await fetchShops(searchQuery, lat, lon, widerMiles);
        if ((wider.shops?.length ?? 0) > 0) {
          data = wider;
          setWidenedNote(`Nothing within ${baseMiles} mi — widened to ${widerMiles} mi.`);
        }
      }

      setResult({ query: searchQuery, lat, lon, shops: data.shops });
      setMatchedTags(data.tags ?? []);
      if ((data.shops?.length ?? 0) > 0) sounds.playSuccess();
      else sounds.playEmpty();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      sounds.playError();
    } finally {
      sounds.stopLoadingLoop();
      setLoading(false);
    }
  }, []);

  // Re-run the current search with the new radius using the coords we already
  // have — no need to re-prompt for location.
  const reSearchWithRadius = useCallback(() => {
    if (result) handleSearch(result.query, result.lat, result.lon);
  }, [result, handleSearch]);

  const hasResults = result && result.shops.length > 0;
  const hasSearched = result !== null;

  return (
    <div className="flex flex-col min-h-[100dvh] md:h-screen bg-[#F7F6F3] text-[#141412] overflow-x-hidden md:overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-5 py-3 border-b border-[#E3E1DB] flex items-center gap-3 bg-white sticky top-0 z-30 md:static">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#141412] flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <span className="font-semibold text-[#141412]">Pinpoint</span>
        </Link>
        <span className="text-[#6B6A63] text-sm hidden sm:block">·</span>
        <span className="text-[#57554E] text-sm hidden sm:block">Find local shops near you</span>
        <div className="ml-auto flex items-center gap-4">
          <SoundToggle />
          <Link href="/wishlist" className="flex items-center gap-1.5 text-sm text-[#57554E] hover:text-[#141412] transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">
        {/* Left panel */}
        <div className="w-full md:w-[400px] md:shrink-0 flex flex-col md:border-r border-[#E3E1DB] md:overflow-hidden bg-[#F2F1ED]">
          <div className="p-4 border-b border-[#E3E1DB] bg-white space-y-3">
            <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} loading={loading} />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="radius" className="text-xs text-[#57554E]">Search radius</label>
                <span className="text-xs font-semibold text-[#141412] tabular-nums">
                  {radiusMiles} {radiusMiles === 1 ? "mile" : "miles"}
                </span>
              </div>
              <input
                id="radius"
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={radiusMiles}
                onChange={(e) => { setMiles(parseFloat(e.target.value)); sounds.playTick(); }}
                onMouseUp={reSearchWithRadius}
                onTouchEnd={reSearchWithRadius}
                aria-label="Search radius in miles"
                className="w-full accent-[#141412] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B6A63] mt-0.5">
                <span>1 mi</span>
                <span>10 mi</span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B6A63] leading-snug flex items-start gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-px shrink-0" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span>
                Your location is used only to find nearby shops — never stored.{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-[#141412]">Privacy</Link>
              </span>
            </p>
          </div>

          <div className="md:flex-1 md:overflow-y-auto p-4 space-y-2">
            {!hasSearched && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] md:h-full text-center py-10 px-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E3E1DB] flex items-center justify-center mx-auto">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6A63" strokeWidth="2">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#141412] mb-1">Discover shops near you</h2>
                    <p className="text-xs text-[#6B6A63] max-w-[200px] leading-relaxed">
                      Type any item above to find local shops that sell it.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                    {EXAMPLE_SEARCHES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="text-xs bg-white hover:bg-[#EAE8E3] border border-[#E3E1DB] text-[#57554E] hover:text-[#141412] px-3 py-1.5 rounded-full transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {loading && (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-4 bg-white border border-[#E3E1DB] animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-3.5 bg-[#E3E1DB] rounded w-2/3" />
                      <div className="h-3.5 bg-[#E3E1DB] rounded w-12" />
                    </div>
                    <div className="h-2.5 bg-[#E3E1DB] rounded w-4/5 mb-2" />
                    <div className="h-2.5 bg-[#E3E1DB] rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="rounded-xl p-4 bg-white border border-[#E3E1DB] text-[#57554E] text-sm" role="alert">
                {error}
              </div>
            )}

            {hasSearched && !loading && !error && !hasResults && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] md:h-full text-center py-12 px-2" role="status" aria-live="polite">
                <p className="text-sm font-medium text-[#141412] mb-1">No shops found for &ldquo;{result.query}&rdquo;</p>
                <p className="text-xs text-[#6B6A63] leading-relaxed max-w-[260px]">
                  We looked within {radiusMiles} {radiusMiles === 1 ? "mile" : "miles"}. Listings come from
                  community OpenStreetMap data, which can be thin in some areas — try a broader term, a larger
                  radius, or a nearby town.
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {hasResults && !loading && (
                <motion.div
                  key={result.query}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-2"
                >
                  <p className="text-xs text-[#6B6A63] pb-1" role="status" aria-live="polite" aria-atomic="true">
                    <span className="text-[#141412] font-semibold">{result.shops.length}</span> shops nearby
                    {matchedTags.length > 0 && (
                      <span> · {matchedTags.slice(0, 3).join(", ")}</span>
                    )}
                  </p>
                  {widenedNote && (
                    <p className="text-[11px] text-[#6B6A63] bg-white border border-[#E3E1DB] rounded-lg px-3 py-2">
                      {widenedNote}
                    </p>
                  )}
                  {result.shops.map((shop, i) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      index={i}
                      active={shop.id === activeShopId}
                      onClick={() => setActiveShopId(shop.id === activeShopId ? null : shop.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Map panel */}
        <div className="relative h-[60vh] md:h-auto md:flex-1 md:min-h-0 bg-[#EAE8E3] border-t md:border-t-0 border-[#E3E1DB]">
          {!hasSearched && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-[#6B6A63] text-sm">Search to see the map</p>
            </div>
          )}
          {hasSearched && (
            <div className="absolute inset-0 p-3">
              <MapView
                userLat={result!.lat}
                userLon={result!.lon}
                shops={result!.shops}
                activeShopId={activeShopId}
                onShopClick={(id) => setActiveShopId(id === activeShopId ? null : id)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchApp />
    </Suspense>
  );
}
