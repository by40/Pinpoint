"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@vercel/analytics";
import ShopCard from "@/components/ShopCard";
import SoundToggle from "@/components/SoundToggle";
import * as sounds from "@/lib/sounds";
import { geocodePlace } from "@/lib/geocode";
import type { Shop } from "@/lib/overpass";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface WishlistItem {
  id: string;
  text: string;
}

interface ItemResult {
  itemId: string;
  shops: Shop[];
  tags: string[];
  loading: boolean;
  error?: string;
}

const STORAGE_KEY = "pinpoint-wishlist";
// Each item triggers its own Overpass query, so cap the list to protect the
// public mirrors (and the user from a very slow batch).
const MAX_ITEMS = 15;
const SUGGESTIONS = [
  "Nike trainers", "vintage Levi's", "denim jacket", "band tee",
  "Dr. Martens", "North Face jacket", "Adidas Sambas", "hoodie",
];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ItemResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  // Manual location fallback (shown when geolocation is denied/unavailable).
  const [geoError, setGeoError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [place, setPlace] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(2);
  // Ref mirror so the stable query runner always reads the latest slider value.
  const radiusMilesRef = useRef(2);
  const setMiles = (m: number) => {
    radiusMilesRef.current = m;
    setRadiusMiles(m);
  };

  useEffect(() => {
    // Load the persisted wishlist after mount — reading localStorage during
    // render would cause an SSR hydration mismatch.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setItems(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items]);

  function addItem(text?: string) {
    const t = (text ?? input).trim();
    if (!t || items.length >= MAX_ITEMS || items.some((i) => i.text.toLowerCase() === t.toLowerCase())) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), text: t }]);
    setInput("");
    track("wishlist_add");
  }

  const atItemLimit = items.length >= MAX_ITEMS;

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setResults((prev) => prev.filter((r) => r.itemId !== id));
    if (activeItemId === id) setActiveItemId(null);
  }

  // Run the per-item shop queries for a known location, using the current radius.
  const runQueries = useCallback(async (lat: number, lon: number) => {
    setSearching(true);
    setUserPos({ lat, lon });
    setSearched(true);
    setActiveShopId(null);

    const radiusM = Math.round(radiusMilesRef.current * 1609.34);

    setResults(items.map((item) => ({ itemId: item.id, shops: [], tags: [], loading: true })));
    setActiveItemId(items[0]?.id ?? null);

    let anyFound = false;
    const fetchItem = async (item: WishlistItem) => {
      try {
        const res = await fetch(
          `/api/shops?q=${encodeURIComponent(item.text)}&lat=${lat}&lon=${lon}&radius=${radiusM}`
        );
        const data = await res.json();
        if ((data.shops?.length ?? 0) > 0) anyFound = true;
        setResults((prev) =>
          prev.map((r) =>
            r.itemId === item.id
              ? { ...r, shops: data.shops ?? [], tags: data.tags ?? [], loading: false }
              : r
          )
        );
      } catch {
        setResults((prev) =>
          prev.map((r) =>
            r.itemId === item.id ? { ...r, loading: false, error: "Search failed" } : r
          )
        );
      }
    };

    // Bounded concurrency: the public Overpass endpoint allows only a couple
    // of concurrent slots per IP, so fire at most 2 item queries at a time.
    const queue = [...items];
    const worker = async () => {
      let next: WishlistItem | undefined;
      while ((next = queue.shift())) {
        await fetchItem(next);
      }
    };
    await Promise.all([worker(), worker()]);

    if (anyFound) sounds.playSuccess();
    else sounds.playEmpty();
    setSearching(false);
  }, [items]);

  const findShops = useCallback(() => {
    if (items.length === 0) return;
    sounds.unlock(); // prime audio within the click gesture
    sounds.playStart();
    sounds.startLoadingLoop();
    setGeoError(null);

    if (!("geolocation" in navigator)) {
      sounds.stopLoadingLoop();
      setManualMode(true);
      setGeoError("Your browser can't share your location. Enter a town or postcode instead.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        runQueries(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        sounds.stopLoadingLoop();
        sounds.playError();
        setLocating(false);
        setSearching(false);
        setManualMode(true);
        setGeoError("Couldn't get your location. Enter a town or postcode instead.");
      },
      { timeout: 10000 }
    );
  }, [items, runQueries]);

  // Geocode a typed place, then run the searches from those coordinates.
  const findShopsAtPlace = useCallback(async () => {
    if (items.length === 0 || !place.trim() || geocoding) return;
    sounds.unlock();
    setGeoError(null);
    setGeocoding(true);
    try {
      const loc = await geocodePlace(place.trim());
      sounds.playStart();
      sounds.startLoadingLoop();
      runQueries(loc.lat, loc.lon);
    } catch (err) {
      sounds.playError();
      setGeoError(err instanceof Error ? err.message : "Location lookup failed.");
    } finally {
      setGeocoding(false);
    }
  }, [items, place, geocoding, runQueries]);

  // Re-run the search with the new radius using the location we already have —
  // no need to re-prompt for geolocation.
  const reSearchWithRadius = useCallback(() => {
    if (!userPos || items.length === 0) return;
    sounds.unlock();
    sounds.playStart();
    sounds.startLoadingLoop();
    runQueries(userPos.lat, userPos.lon);
  }, [userPos, items, runQueries]);

  const activeResult = results.find((r) => r.itemId === activeItemId);
  const shownShops = activeResult?.shops ?? [];
  const coveredCount = results.filter((r) => r.shops.length > 0).length;
  const totalLoading = results.some((r) => r.loading);
  const unusedSuggestions = SUGGESTIONS.filter(
    (s) => !items.some((i) => i.text.toLowerCase() === s.toLowerCase())
  );

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
        <span className="text-[#57554E] text-sm hidden sm:block font-medium">My Outfit List</span>
        <div className="ml-auto flex items-center gap-4">
          <SoundToggle />
          <Link href="/search" className="text-sm text-[#57554E] hover:text-[#141412] transition-colors">
            Search
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">

        {/* Left panel */}
        <div className="w-full md:w-[400px] md:shrink-0 flex flex-col md:border-r border-[#E3E1DB] md:overflow-hidden bg-[#F2F1ED]">

          {/* Add item */}
          <div className="p-4 border-b border-[#E3E1DB] bg-white space-y-3">
            <form onSubmit={(e) => { e.preventDefault(); addItem(); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={80}
                disabled={atItemLimit}
                placeholder={atItemLimit ? `Limit of ${MAX_ITEMS} items reached` : "Add an item… e.g. Nike trainers"}
                className="flex-1 bg-white border border-[#E3E1DB] text-[#141412] placeholder-[#6B6A63] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#141412]/40 focus:ring-1 focus:ring-[#141412]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || atItemLimit}
                whileTap={{ scale: 0.97 }}
                className="bg-[#141412] hover:bg-[#2A2A28] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Add
              </motion.button>
            </form>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="wl-radius" className="text-xs text-[#57554E]">Search radius</label>
                <span className="text-xs font-semibold text-[#141412] tabular-nums">
                  {radiusMiles} {radiusMiles === 1 ? "mile" : "miles"}
                </span>
              </div>
              <input
                id="wl-radius"
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

          <div className="md:flex-1 md:overflow-y-auto">

            {/* Empty state */}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] md:h-full text-center py-10 px-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E3E1DB] flex items-center justify-center mx-auto">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6A63" strokeWidth="1.5">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                      <line x1="9" y1="12" x2="15" y2="12" />
                      <line x1="9" y1="16" x2="13" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#141412] mb-1">Your list is empty</h3>
                    <p className="text-xs text-[#6B6A63] leading-relaxed max-w-[200px]">
                      Add clothes above, then find shops for the whole outfit at once.
                    </p>
                  </div>
                  <div className="pt-1">
                    <p className="text-[9px] text-[#6B6A63] uppercase tracking-widest mb-2">Try these</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {SUGGESTIONS.slice(0, 5).map((s) => (
                        <button
                          key={s}
                          onClick={() => addItem(s)}
                          className="text-xs bg-white hover:bg-[#EAE8E3] border border-[#E3E1DB] text-[#57554E] hover:text-[#141412] px-3 py-1.5 rounded-full transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Items + results */}
            {items.length > 0 && (
              <div className="p-4 space-y-1.5">

                {/* Coverage summary */}
                <AnimatePresence>
                  {searched && !totalLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-3 p-3.5 rounded-xl border border-[#E3E1DB] bg-white flex items-center justify-between"
                      role="status"
                      aria-live="polite"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#141412]">
                          {coveredCount === items.length
                            ? `All ${items.length} items found`
                            : `${coveredCount} of ${items.length} items found`}
                        </p>
                        <p className="text-xs text-[#6B6A63] mt-0.5">within {radiusMiles} {radiusMiles === 1 ? "mile" : "miles"} · tap an item to see shops</p>
                      </div>
                      <div className={`text-xs font-bold tabular-nums ${coveredCount === items.length ? "text-[#141412]" : "text-[#6B6A63]"}`}>
                        {coveredCount}/{items.length}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Item rows */}
                <AnimatePresence initial={false}>
                  {items.map((item, i) => {
                    const result = results.find((r) => r.itemId === item.id);
                    const isActive = activeItemId === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <div
                          onClick={() => {
                            setActiveItemId(isActive ? null : item.id);
                            setActiveShopId(null);
                          }}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isActive}
                          aria-label={`${item.text}${result && !result.loading ? `, ${result.shops.length > 0 ? `${result.shops.length} shops` : "no shops"} found` : ""}. Toggle shop list.`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveItemId(isActive ? null : item.id);
                              setActiveShopId(null);
                            }
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                            isActive
                              ? "border-[#141412]/30 bg-white"
                              : "border-[#E3E1DB] bg-white hover:border-[#141412]/20"
                          }`}
                        >
                          <span className="text-[#6B6A63] text-xs tabular-nums w-4 shrink-0 text-right">{i + 1}.</span>
                          <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.text}</span>

                          {result?.loading && (
                            <svg className="animate-spin h-3.5 w-3.5 text-[#6B6A63] shrink-0" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          )}
                          {result && !result.loading && (
                            <span className={`text-xs shrink-0 ${result.shops.length > 0 ? "text-[#141412] font-medium" : "text-[#6B6A63]"}`}>
                              {result.shops.length > 0 ? `${result.shops.length} shops` : "none"}
                            </span>
                          )}

                          <svg
                            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            className={`shrink-0 text-[#6B6A63] transition-transform duration-200 ${isActive ? "rotate-90" : ""}`}
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>

                          <button
                            onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                            aria-label={`Remove ${item.text}`}
                            className="shrink-0 text-[#6B6A63] hover:text-[#141412] transition-colors text-base leading-none ml-0.5"
                          >
                            ×
                          </button>
                        </div>

                        {/* Expanded shops */}
                        <AnimatePresence>
                          {isActive && result && !result.loading && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-1.5 pl-3 space-y-1.5">
                                {result.shops.length === 0 && (
                                  <p className="text-xs text-[#6B6A63] py-2 px-3">No shops found within {radiusMiles} {radiusMiles === 1 ? "mile" : "miles"}. Try a broader radius or term.</p>
                                )}
                                {result.shops.slice(0, 6).map((shop, si) => (
                                  <ShopCard
                                    key={shop.id}
                                    shop={shop}
                                    index={si}
                                    active={shop.id === activeShopId}
                                    onClick={() => setActiveShopId(shop.id === activeShopId ? null : shop.id)}
                                  />
                                ))}
                                {result.shops.length > 6 && (
                                  <p className="text-xs text-[#6B6A63] text-center py-1">
                                    +{result.shops.length - 6} more shops
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Quick add */}
                {unusedSuggestions.length > 0 && (
                  <div className="pt-3 pb-1">
                    <p className="text-[9px] text-[#6B6A63] uppercase tracking-widest mb-2">Quick add</p>
                    <div className="flex flex-wrap gap-1.5">
                      {unusedSuggestions.slice(0, 6).map((s) => (
                        <button
                          key={s}
                          onClick={() => addItem(s)}
                          className="text-[11px] bg-white hover:bg-[#EAE8E3] border border-[#E3E1DB] text-[#57554E] hover:text-[#141412] px-2.5 py-1 rounded-full transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Find shops button */}
                <div className="pt-3">
                  <motion.button
                    onClick={findShops}
                    disabled={locating || searching}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#141412] hover:bg-[#2A2A28] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {locating || searching ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {locating ? "Getting location…" : `Searching ${items.length} items…`}
                      </>
                    ) : searched ? (
                      "Search again"
                    ) : (
                      `Find shops for ${items.length} item${items.length !== 1 ? "s" : ""}`
                    )}
                  </motion.button>

                  {/* Manual location fallback when geolocation is unavailable */}
                  {manualMode && (
                    <form
                      onSubmit={(e) => { e.preventDefault(); findShopsAtPlace(); }}
                      className="mt-2 flex gap-2"
                    >
                      <input
                        type="text"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        maxLength={80}
                        placeholder="Town or postcode… e.g. Brighton or BN1 1AA"
                        aria-label="Town or postcode"
                        className="flex-1 bg-white border border-[#E3E1DB] text-[#141412] placeholder-[#6B6A63] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#141412]/40 focus:ring-1 focus:ring-[#141412]/10 transition-colors"
                      />
                      <motion.button
                        type="submit"
                        disabled={geocoding || !place.trim()}
                        whileTap={{ scale: 0.97 }}
                        className="bg-[#141412] hover:bg-[#2A2A28] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                      >
                        {geocoding ? "Finding…" : "Use this"}
                      </motion.button>
                    </form>
                  )}

                  {geoError && (
                    <p className="mt-2 text-[#57554E] text-xs" role="alert">{geoError}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map panel */}
        <div className="relative h-[60vh] md:h-auto md:flex-1 md:min-h-0 bg-[#EAE8E3] border-t md:border-t-0 border-[#E3E1DB]">
          {!searched && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B6A63" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>
              <p className="text-[#6B6A63] text-sm">Add items and tap &ldquo;Find shops&rdquo;</p>
            </div>
          )}

          {/* Item tab bar */}
          {searched && items.length > 1 && (
            <div className="absolute top-3 left-3 right-3 z-10 flex gap-1.5 overflow-x-auto pb-1">
              {items.map((item) => {
                const res = results.find((r) => r.itemId === item.id);
                const isActive = activeItemId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveItemId(item.id); setActiveShopId(null); }}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap ${
                      isActive
                        ? "bg-[#141412] text-white border-[#141412]"
                        : "bg-white text-[#57554E] border-[#E3E1DB] hover:border-[#141412]/30 hover:text-[#141412]"
                    }`}
                  >
                    {item.text}
                    {res && !res.loading && res.shops.length > 0 && (
                      <span className={`ml-1.5 ${isActive ? "text-white/60" : "text-[#6B6A63]"}`}>
                        {res.shops.length}
                      </span>
                    )}
                    {res?.loading && (
                      <svg className="inline animate-spin h-2.5 w-2.5 ml-1.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {searched && userPos && (
            <div className={`absolute inset-0 p-3 ${items.length > 1 ? "pt-14" : ""}`}>
              <MapView
                userLat={userPos.lat}
                userLon={userPos.lon}
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
