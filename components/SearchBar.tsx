"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { unlock } from "@/lib/sounds";
import { geocodePlace } from "@/lib/geocode";

interface Props {
  onSearch: (query: string, lat: number, lon: number) => void;
  loading: boolean;
  value?: string;
  onChange?: (v: string) => void;
}

export default function SearchBar({ onSearch, loading, value: controlledValue, onChange }: Props) {
  const [internal, setInternal] = useState(controlledValue ?? "");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Manual location fallback (shown when geolocation is denied/unavailable).
  const [manualMode, setManualMode] = useState(false);
  const [place, setPlace] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  const query = controlledValue !== undefined ? controlledValue : internal;
  const setQuery = (v: string) => { if (onChange) onChange(v); else setInternal(v); };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    unlock(); // prime the audio context within this user gesture
    setError(null);

    if (!("geolocation" in navigator)) {
      setManualMode(true);
      setError("Your browser can't share your location. Enter a town or postcode instead.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onSearch(query.trim(), pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setManualMode(true);
        setError("Couldn't get your location. Enter a town or postcode instead.");
      },
      { timeout: 10000 }
    );
  }

  async function handleManualSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) { setError("Type an item to search for first."); return; }
    if (!place.trim() || geocoding) return;
    unlock();
    setError(null);
    setGeocoding(true);
    try {
      const loc = await geocodePlace(place.trim());
      onSearch(query.trim(), loc.lat, loc.lon);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Location lookup failed.");
    } finally {
      setGeocoding(false);
    }
  }

  const busy = loading || locating;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6A63] pointer-events-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={80}
            placeholder="Search for an item… e.g. vinyl records"
            className="w-full bg-white border border-[#E3E1DB] text-[#141412] placeholder-[#6B6A63] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#141412]/40 focus:ring-1 focus:ring-[#141412]/10 transition-colors"
          />
        </div>
        <motion.button
          type="submit"
          disabled={busy || !query.trim()}
          whileTap={{ scale: 0.97 }}
          className="bg-[#141412] hover:bg-[#2A2A28] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {busy ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {locating ? "Locating…" : "Searching…"}
            </>
          ) : (
            "Find Shops"
          )}
        </motion.button>
      </form>

      {manualMode && (
        <form onSubmit={handleManualSearch} className="mt-2 flex gap-2">
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
            className="bg-[#141412] hover:bg-[#2A2A28] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {geocoding ? "Finding…" : "Use this"}
          </motion.button>
        </form>
      )}

      {error && (
        <p className="mt-2 text-[#57554E] text-xs" role="alert">{error}</p>
      )}
    </div>
  );
}
