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

function userPinEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:14px;height:14px;background:#141412;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 0 4px rgba(20,20,18,0.15)";
  return el;
}

function shopPinEl(isActive: boolean, label: string): HTMLDivElement {
  const el = document.createElement("div");
  const size = isActive ? 18 : 12;
  el.style.cssText = `width:${size}px;height:${size}px;background:${
    isActive ? "#141412" : "#57554E"
  };border:${isActive ? "3px" : "2px"} solid ${
    isActive ? "#ffffff" : "#EAE8E3"
  };border-radius:50%;box-shadow:0 2px 6px rgba(20,20,18,0.25);cursor:pointer;transition:all 0.2s`;
  // Keyboard-operable, labelled pin for screen readers.
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", label);
  el.setAttribute("aria-pressed", String(isActive));
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
  return `<div style="font-family:monospace;min-width:140px"><strong style="font-size:13px;color:#141412">${escapeHtml(shop.name)}</strong><br><span style="color:#6B6A63;font-size:11px">${escapeHtml(shop.address)}</span><br><span style="color:#57554E;font-size:11px;font-weight:600">${dist}</span></div>`;
}

export default function MapView({ userLat, userLon, shops, activeShopId, onShopClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maplibreRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

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
              "fill-extrusion-color": "#F2F1ED",
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 6],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
              "fill-extrusion-opacity": 0.9,
            },
          },
          firstSymbol
        );

        // User pin
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
        markersRef.current = [];
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

  // Render shop markers when the result set or selection changes.
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;
    if (!ready || !map || !maplibregl) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    shops.forEach((shop) => {
      const isActive = shop.id === activeShopId;
      const el = shopPinEl(isActive, `${shop.name}, ${formatDistance(shop.distanceKm)} away`);
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([shop.lon, shop.lat])
        .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(popupHTML(shop)))
        .addTo(map);

      el.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        onShopClick(shop.id);
      });
      el.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onShopClick(shop.id);
        }
      });

      markersRef.current.push(marker);
    });

    // Frame all results, keeping the 3D tilt and not over-zooming on tight sets.
    if (shops.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      shops.forEach((s) => bounds.extend([s.lon, s.lat]));
      map.fitBounds(bounds, { padding: 56, maxZoom: 16, pitch: 45, duration: 600 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops, activeShopId, ready]);

  // Pan to the active shop.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !activeShopId) return;
    const shop = shops.find((s) => s.id === activeShopId);
    if (shop) map.easeTo({ center: [shop.lon, shop.lat] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeShopId, ready]);

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />;
}
