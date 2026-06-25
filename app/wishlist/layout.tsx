import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Add everything you need, then find local shops for every item at once — each mapped and sorted by distance.",
  alternates: { canonical: "/wishlist" },
  openGraph: {
    title: "Wishlist · Pinpoint",
    description: "Add everything you need, then find local shops for every item at once.",
    url: "/wishlist",
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
