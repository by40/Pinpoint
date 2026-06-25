import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search a clothing brand or item and instantly see nearby shops likely to sell it on an interactive 3D map, sorted by distance.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search · Pinpoint",
    description: "Search a clothing brand or item and instantly see nearby shops likely to sell it on an interactive 3D map.",
    url: "/search",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
