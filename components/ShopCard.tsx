"use client";

import { motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { formatDistance, type Shop } from "@/lib/overpass";
import type { OpenState } from "@/lib/openNow";

function typeLabel(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  shop: Shop;
  index: number;
  active: boolean;
  openState?: OpenState;
  onClick: () => void;
}

export default function ShopCard({ shop, index, active, openState, onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={onClick}
      // The card contains its own website/phone links, so it can't be a <button>
      // (nested interactives). Expose it as a keyboard-operable button instead.
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`${shop.name}, ${formatDistance(shop.distanceKm)} away. Select to highlight on map.`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`cursor-pointer rounded-xl p-3.5 border transition-colors bg-surface ${
        active
          ? "border-accent ring-1 ring-accent/30"
          : "border-line hover:border-accent/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-ink font-bold text-sm leading-tight">{shop.name}</h3>
        <div className="flex items-center gap-1 shrink-0">
          {shop.brand && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent text-on-accent">
              {shop.brand}
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-panel text-muted border border-line">
            {typeLabel(shop.shopType)}
          </span>
        </div>
      </div>

      <p className="mt-1 text-faint text-xs leading-snug">{shop.address}</p>

      <div className="mt-2.5 flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-ink text-xs font-medium">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          {formatDistance(shop.distanceKm)}
        </span>

        <span title="Estimated price range" className="flex items-center gap-0.5">
          <span className="text-faint text-[10px]">est.</span>
          <span className={`text-xs font-semibold tabular-nums ${
            shop.priceRange === 1 ? "text-ink" : shop.priceRange === 2 ? "text-muted" : "text-faint"
          }`}>
            {"£".repeat(shop.priceRange)}
          </span>
        </span>

        {(openState === "open" || openState === "closed") && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${openState === "open" ? "bg-success" : "bg-faint"}`} />
            <span className={openState === "open" ? "text-success" : "text-faint"}>
              {openState === "open" ? "Open" : "Closed"}
            </span>
          </span>
        )}

        {shop.openingHours && (
          <span className="text-faint text-xs truncate max-w-[140px]" title={shop.openingHours}>
            {shop.openingHours}
          </span>
        )}

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            track("directions");
          }}
          className="text-xs font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
        >
          Directions
        </a>

        {shop.website && (
          <a
            href={shop.website.startsWith("http") ? shop.website : `https://${shop.website}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-muted hover:text-accent hover:underline transition-colors"
          >
            Website
          </a>
        )}
        {shop.phone && (
          <a
            href={`tel:${shop.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-faint hover:text-accent transition-colors"
          >
            {shop.phone}
          </a>
        )}
      </div>
    </motion.div>
  );
}
