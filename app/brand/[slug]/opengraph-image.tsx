import { renderOgImage, ogSize, ogContentType } from "@/lib/og";
import { FEATURED_BRANDS, getBrand } from "@/lib/brands";

export const alt = "Find this brand near you · Pinpoint";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return FEATURED_BRANDS.map((b) => ({ slug: b.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  const name = brand?.name ?? "your favourite brands";
  return renderOgImage({
    line1: `Where to buy`,
    line2: `${name} near you.`,
    subtitle: "Local shops likely to sell it, mapped in 3D.",
  });
}
