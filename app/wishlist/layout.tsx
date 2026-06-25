import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outfit List",
  description: "Add every piece of an outfit, then find local shops for all of it at once — each mapped and sorted by distance.",
  alternates: { canonical: "/wishlist" },
  openGraph: {
    title: "Outfit List · Pinpoint",
    description: "Add every piece of an outfit, then find local shops for all of it at once.",
    url: "/wishlist",
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
