"use client";

import { useState, useCallback, useRef, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { track } from "@vercel/analytics";
import SearchBar from "@/components/SearchBar";
import ShopCard from "@/components/ShopCard";
import SoundToggle from "@/components/SoundToggle";
import * as sounds from "@/lib/sounds";
import type { Shop } from "@/lib/overpass";
import { computeOpenStates, type OpenState } from "@/lib/openNow";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface SearchState {
  query: string;
  lat: number;
  lon: number;
  shops: Shop[];
}

const EXAMPLE_SEARCHES = ["Nike trainers", "vintage Levi's", "North Face jacket", "Adidas Sambas", "Dr. Martens"];

function SearchApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchState | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [matchedTags, setMatchedTags] = useState<string[]>([]);
  const [matchedBrands, setMatchedBrands] = useState<string[]>([]);
  const [brandOnly, setBrandOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [openStates, setOpenStates] = useState<Record<string, OpenState>>({});
  const [rejected, setRejected] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");
  const [widenedNote, setWidenedNote] = useState<string | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(2);
  // Ref mirror so the stable handleSearch always reads the latest slider value.
  const radiusMilesRef = useRef(2);
  const setMiles = (m: number) => {
    radiusMilesRef.current = m;
    setRadiusMiles(m);
  };

  // Hard cap on how long a single search may run before we give up and show
  // "no shops near you" rather than leaving the user staring at a spinner.
  // Covers the whole flow (initial fetch + the optional auto-widen retry).
  const SEARCH_TIMEOUT_MS = 20_000;

  const fetchShops = async (q: string, lat: number, lon: number, miles: number, signal?: AbortSignal) => {
    const radiusM = Math.round(miles * 1609.34);
    const res = await fetch(
      `/api/shops?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}&radius=${radiusM}`,
      { signal }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch shops");
    return data as { shops: Shop[]; tags: string[]; brands: string[]; rejected?: boolean };
  };

  const handleSearch = useCallback(async (searchQuery: string, lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    setActiveShopId(null);
    setWidenedNote(null);
    setRejected(false);
    setTimedOut(false);
    setOpenNow(false);
    setOpenStates({});
    sounds.playStart();
    sounds.startLoadingLoop();

    const baseMiles = radiusMilesRef.current;

    // Abort the in-flight request(s) once the 30s budget is spent.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

    try {
      let data = await fetchShops(searchQuery, lat, lon, baseMiles, controller.signal);

      // Auto-broaden once if nothing turned up and we're not already at the cap —
      // thin OpenStreetMap coverage shouldn't read as "no shops exist". Skip for
      // rejected (non-clothing) queries — widening won't help those.
      if (!data.rejected && (data.shops?.length ?? 0) === 0 && baseMiles < 10) {
        const widerMiles = Math.min(baseMiles * 2, 10);
        const wider = await fetchShops(searchQuery, lat, lon, widerMiles, controller.signal);
        if ((wider.shops?.length ?? 0) > 0) {
          data = wider;
          setWidenedNote(`Nothing within ${baseMiles} mi — widened to ${widerMiles} mi.`);
        }
      }

      setResult({ query: searchQuery, lat, lon, shops: data.shops });
      setMatchedTags(data.tags ?? []);
      setMatchedBrands(data.brands ?? []);
      setRejected(data.rejected ?? false);
      setBrandOnly(false);
      // Reflect the query in the URL so the search is shareable/bookmarkable.
      router.replace(`/search?q=${encodeURIComponent(searchQuery)}`, { scroll: false });
      if (data.rejected) track("search_rejected", { q: searchQuery });
      else track("search", { q: searchQuery, results: data.shops?.length ?? 0 });
      if ((data.shops?.length ?? 0) > 0) sounds.playSuccess();
      else sounds.playEmpty();
    } catch (err) {
      // 30s budget hit: resolve to a clean "0 results" state instead of an error.
      if (controller.signal.aborted) {
        setResult({ query: searchQuery, lat, lon, shops: [] });
        setMatchedTags([]);
        setMatchedBrands([]);
        setRejected(false);
        setBrandOnly(false);
        setTimedOut(true);
        router.replace(`/search?q=${encodeURIComponent(searchQuery)}`, { scroll: false });
        track("search_timeout", { q: searchQuery });
        sounds.playEmpty();
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
        sounds.playError();
      }
    } finally {
      clearTimeout(timeout);
      sounds.stopLoadingLoop();
      setLoading(false);
    }
  }, [router]);

  // Re-run the current search with the new radius using the coords we already
  // have — no need to re-prompt for location.
  const reSearchWithRadius = useCallback(() => {
    if (result) handleSearch(result.query, result.lat, result.lon);
  }, [result, handleSearch]);

  // Resolve each shop's open/closed status once results arrive. Done off the
  // render path (and via a dynamically-imported parser) so it never blocks the
  // list from showing.
  useEffect(() => {
    // openStates is already cleared in handleSearch before a new result lands, so
    // here we only need to populate it (async, off the render path).
    if (!result || result.shops.length === 0) return;
    let cancelled = false;
    computeOpenStates(result.shops).then((states) => {
      if (!cancelled) setOpenStates(states);
    });
    return () => {
      cancelled = true;
    };
  }, [result]);

  const hasResults = result && result.shops.length > 0;
  const hasSearched = result !== null;

  // A shop is a confirmed stockist when its OSM brand matches a searched brand.
  const isStockist = useCallback(
    (s: Shop) =>
      !!s.brand && matchedBrands.some((b) => s.brand!.toLowerCase().includes(b.toLowerCase())),
    [matchedBrands]
  );
  const stockistCount = useMemo(
    () => (result ? result.shops.filter(isStockist).length : 0),
    [result, isStockist]
  );
  const openCount = useMemo(
    () => (result ? result.shops.filter((s) => openStates[s.id] === "open").length : 0),
    [result, openStates]
  );
  // What we actually render on the list + map (respects brand-only + open-now).
  const shownShops = useMemo(() => {
    if (!result) return [];
    let shops = result.shops;
    if (brandOnly) shops = shops.filter(isStockist);
    if (openNow) shops = shops.filter((s) => openStates[s.id] === "open");
    return shops;
  }, [result, brandOnly, openNow, openStates, isStockist]);

  async function shareSearch() {
    if (typeof window === "undefined" || !result) return;
    const url = `${window.location.origin}/search?q=${encodeURIComponent(result.query)}`;
    const data = { title: "Pinpoint", text: `Find "${result.query}" in shops near you`, url };
    track("share", { q: result.query });
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        setShareLabel("Copied!");
        setTimeout(() => setShareLabel("Share"), 1500);
      }
    } catch { /* user cancelled share */ }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] md:h-screen bg-bg text-ink overflow-x-hidden md:overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-5 py-3 border-b-2 border-ink flex items-center gap-3 bg-surface sticky top-0 z-30 md:static">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <span className="font-display font-bold uppercase tracking-tight text-ink">Pinpoint</span>
        </Link>
        <span className="kicker text-faint hidden sm:block ml-1">Find clothes near you</span>
        <div className="ml-auto flex items-center gap-4">
          <SoundToggle />
          <Link href="/wishlist" className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-muted hover:text-accent transition-colors">
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
        <div className="w-full md:w-[400px] md:shrink-0 flex flex-col md:border-r border-line md:overflow-hidden bg-panel">
          <div className="p-4 border-b border-line bg-surface space-y-3">
            <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} loading={loading} />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="radius" className="text-xs text-muted">Search radius</label>
                <span className="text-xs font-semibold text-ink tabular-nums">
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
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-faint mt-0.5">
                <span>1 mi</span>
                <span>10 mi</span>
              </div>
            </div>

            <p className="text-[11px] text-faint leading-snug flex items-start gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-px shrink-0" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span>
                Your location is used only to find nearby shops — never stored.{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-accent">Privacy</Link>
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
                  <div className="w-12 h-12 rounded-xl bg-surface border border-line flex items-center justify-center mx-auto">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a8794" strokeWidth="2">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-ink mb-1">Find clothes near you</h2>
                    <p className="text-xs text-faint max-w-[200px] leading-relaxed">
                      Search a brand or item above to find local shops likely to sell it.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                    {EXAMPLE_SEARCHES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="text-xs bg-surface hover:bg-panel border border-line text-muted hover:text-accent px-3 py-1.5 rounded-full transition-colors"
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
                  <div key={i} className="rounded-xl p-4 bg-surface border border-line animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-3.5 bg-line rounded w-2/3" />
                      <div className="h-3.5 bg-line rounded w-12" />
                    </div>
                    <div className="h-2.5 bg-line rounded w-4/5 mb-2" />
                    <div className="h-2.5 bg-line rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="rounded-xl p-4 bg-surface border border-line text-muted text-sm" role="alert">
                {error}
              </div>
            )}

            {hasSearched && !loading && !error && !hasResults && rejected && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] md:h-full text-center py-12 px-2" role="status" aria-live="polite">
                <p className="text-sm font-medium text-ink mb-1">Pinpoint is for clothes &amp; fashion</p>
                <p className="text-xs text-faint leading-relaxed max-w-[260px] mb-4">
                  &ldquo;{result.query}&rdquo; doesn&apos;t look like clothing. Try a brand or a garment instead —
                  like one of these:
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {EXAMPLE_SEARCHES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="text-xs bg-surface hover:bg-panel border border-line text-muted hover:text-accent px-3 py-1.5 rounded-full transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSearched && !loading && !error && !hasResults && !rejected && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] md:h-full text-center py-12 px-2" role="status" aria-live="polite">
                <p className="text-sm font-medium text-ink mb-1">
                  {timedOut ? "No shops near you" : `No shops found for “${result.query}”`}
                </p>
                <p className="text-xs text-faint leading-relaxed max-w-[260px]">
                  {timedOut
                    ? "We couldn’t find anything nearby in time. Please try again, widen your search radius, or try a nearby town."
                    : `We looked within ${radiusMiles} ${radiusMiles === 1 ? "mile" : "miles"}. Clothing listings come from community OpenStreetMap data, which can be thin in some areas — try a brand name, a broader item, a larger radius, or a nearby town.`}
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
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <p className="text-xs text-faint" role="status" aria-live="polite" aria-atomic="true">
                      <span className="text-ink font-semibold">{shownShops.length}</span>{" "}
                      {brandOnly ? "confirmed stockists" : "shops that may stock this"}
                      {!brandOnly && matchedBrands.length > 0 ? (
                        <span> · <span className="text-ink">{matchedBrands.slice(0, 3).join(", ")}</span></span>
                      ) : !brandOnly && matchedTags.length > 0 ? (
                        <span> · {matchedTags.slice(0, 3).join(", ")}</span>
                      ) : null}
                    </p>
                    <button
                      onClick={shareSearch}
                      className="shrink-0 text-xs text-muted hover:text-accent flex items-center gap-1 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
                      </svg>
                      {shareLabel}
                    </button>
                  </div>

                  {(matchedBrands.length > 0 && stockistCount > 0) || openCount > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchedBrands.length > 0 && stockistCount > 0 && (
                        <button
                          onClick={() => {
                            setBrandOnly((v) => !v);
                            track("filter_brand_only");
                          }}
                          aria-pressed={brandOnly}
                          className={`flex-1 min-w-[140px] text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                            brandOnly
                              ? "bg-accent text-white border-accent"
                              : "bg-surface text-muted border-line hover:border-accent/30 hover:text-accent"
                          }`}
                        >
                          {brandOnly
                            ? `${matchedBrands.join(", ")} only — show all`
                            : `${matchedBrands.join(", ")} stores only (${stockistCount})`}
                        </button>
                      )}
                      {openCount > 0 && (
                        <button
                          onClick={() => {
                            setOpenNow((v) => !v);
                            track("filter_open_now");
                          }}
                          aria-pressed={openNow}
                          className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                            openNow
                              ? "bg-accent text-white border-accent"
                              : "bg-surface text-muted border-line hover:border-accent/30 hover:text-accent"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${openNow ? "bg-white" : "bg-success"}`} />
                          {openNow ? "Showing open — show all" : `Open now (${openCount})`}
                        </button>
                      )}
                    </div>
                  ) : null}

                  {widenedNote && (
                    <p className="text-[11px] text-faint bg-surface border border-line rounded-lg px-3 py-2">
                      {widenedNote}
                    </p>
                  )}
                  {shownShops.map((shop, i) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      index={i}
                      active={shop.id === activeShopId}
                      openState={openStates[shop.id]}
                      onClick={() => setActiveShopId(shop.id === activeShopId ? null : shop.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Map panel */}
        <div className="relative h-[60vh] md:h-auto md:flex-1 md:min-h-0 bg-panel border-t md:border-t-0 border-line">
          {!hasSearched && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-faint text-sm">Search to see the map</p>
            </div>
          )}
          {hasSearched && (
            <div className="absolute inset-0 p-3">
              <MapView
                userLat={result!.lat}
                userLon={result!.lon}
                shops={shownShops}
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
      <MotionConfig reducedMotion="user">
        <SearchApp />
      </MotionConfig>
    </Suspense>
  );
}
