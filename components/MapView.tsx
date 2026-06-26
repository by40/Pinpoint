"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistance, type Shop } from "@/lib/overpass";

// MapLibre GL is loaded dynamically to avoid SSR issues.
interface Props {
  userLat: number;
  userLon: number;
  shops: Shop[];
  activeShopId: string | null;
  onShopClick: (id: string) => void;
}

const SHOP_SOURCE = "shops";
const SHOP_LAYER = "shop-pins";

function userPinEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:14px;height:14px;background:#6b2bf2;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 0 4px rgba(107,43,242,0.28)";
  return el;
}

// Shop name/address come from user-editable OpenStreetMap data and are injected
// via setHTML, so they MUST be escaped to prevent stored-XSS in map popups.
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

function popupHTML(shop: Shop): string {
  const dist = `${formatDistance(shop.distanceKm)} away`;
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`;
  return `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:150px"><strong style="font-size:13px;color:#15131c">${escapeHtml(shop.name)}</strong><br><span style="color:#8a8794;font-size:11px">${escapeHtml(shop.address)}</span><br><span style="color:#5c5968;font-size:11px;font-weight:600">${dist}</span><br><a href="${dir}" target="_blank" rel="noopener noreferrer" style="color:#6b2bf2;font-size:11px;font-weight:600;text-decoration:underline">Directions →</a></div>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFeatureCollection(shops: Shop[]): any {
  return {
    type: "FeatureCollection",
    features: shops.map((s) => ({
      type: "Feature",
      id: s.id,
      properties: { id: s.id, name: s.name },
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
    })),
  };
}

export default function MapView({ userLat, userLon, shops, activeShopId, onShopClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maplibreRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const popupRef = useRef<any>(null);
  const prevActiveRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  // Keep latest props in refs so the map's (once-registered) event handlers and
  // effects can read current values without re-binding.
  const shopsRef = useRef(shops);
  const onShopClickRef = useRef(onShopClick);
  useEffect(() => { shopsRef.current = shops; }, [shops]);
  useEffect(() => { onShopClickRef.current = onShopClick; }, [onShopClick]);

  // Create the map once on mount; tear it down on unmount.
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (cancelled || mapRef.current) return;
      maplibreRef.current = maplibregl;

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [userLon, userLat],
        zoom: 14,
        pitch: 45,
        bearing: -15,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

      map.on("load", () => {
        if (cancelled) return;

        // White 3D building extrusions (positron's own building layer is flat).
        const firstSymbol = map.getStyle().layers.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (l: any) => l.type === "symbol"
        )?.id;
        map.addLayer(
          {
            id: "3d-buildings",
            source: "openmaptiles",
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 13,
            paint: {
              "fill-extrusion-color": "#f4f3f8",
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 6],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
              "fill-extrusion-opacity": 0.9,
            },
          },
          firstSymbol
        );

        // Shop pins rendered on the GPU (one circle layer) instead of one DOM
        // marker per shop — stays smooth with many pins on the pitched 3D map.
        // promoteId lets us drive the active/selected style via feature-state.
        map.addSource(SHOP_SOURCE, {
          type: "geojson",
          data: toFeatureCollection(shopsRef.current),
          promoteId: "id",
        });
        const active = ["boolean", ["feature-state", "active"], false];
        map.addLayer({
          id: SHOP_LAYER,
          type: "circle",
          source: SHOP_SOURCE,
          paint: {
            "circle-radius": ["case", active, 8, 5],
            "circle-color": ["case", active, "#6b2bf2", "#a78bfa"],
            "circle-stroke-width": ["case", active, 3, 2],
            "circle-stroke-color": ["case", active, "#ffffff", "#ede9fe"],
          },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        popupRef.current = new maplibregl.Popup({ offset: 14, closeButton: false });

        map.on("click", SHOP_LAYER, (e: { features?: Array<{ properties?: { id?: string } }> }) => {
          const id = e.features?.[0]?.properties?.id;
          if (id) onShopClickRef.current(id);
        });
        map.on("mouseenter", SHOP_LAYER, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", SHOP_LAYER, () => { map.getCanvas().style.cursor = ""; });

        // User pin (a single DOM marker is cheap).
        userMarkerRef.current = new maplibregl.Marker({ element: userPinEl() })
          .setLngLat([userLon, userLat])
          .setPopup(new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML("You are here"))
          .addTo(map);

        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        userMarkerRef.current = null;
        popupRef.current = null;
      }
    };
  // Map is created once; location/shops handled by the effects below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the user's location when it changes (e.g. a new search from a new fix).
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !userMarkerRef.current) return;
    userMarkerRef.current.setLngLat([userLon, userLat]);
    map.easeTo({ center: [userLon, userLat] });
  }, [userLon, userLat, ready]);

  // Push the result set into the GPU source and frame it.
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;
    if (!ready || !map || !maplibregl) return;

    const source = map.getSource(SHOP_SOURCE);
    if (source) source.setData(toFeatureCollection(shops));

    if (shops.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      shops.forEach((s) => bounds.extend([s.lon, s.lat]));
      map.fitBounds(bounds, { padding: 56, maxZoom: 16, pitch: 45, duration: 600 });
    }
  }, [shops, ready]);

  // Reflect the active selection: update feature-state, pan, and show the popup.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    const prev = prevActiveRef.current;
    if (prev && prev !== activeShopId) {
      try { map.setFeatureState({ source: SHOP_SOURCE, id: prev }, { active: false }); } catch { /* feature gone */ }
    }

    if (activeShopId) {
      try { map.setFeatureState({ source: SHOP_SOURCE, id: activeShopId }, { active: true }); } catch { /* not loaded yet */ }
      const shop = shopsRef.current.find((s) => s.id === activeShopId);
      if (shop) {
        map.easeTo({ center: [shop.lon, shop.lat] });
        popupRef.current?.setLngLat([shop.lon, shop.lat]).setHTML(popupHTML(shop)).addTo(map);
      }
    } else {
      popupRef.current?.remove();
    }

    prevActiveRef.current = activeShopId;
  }, [activeShopId, ready]);

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />;
}
