import { renderOgImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Pinpoint — Search a brand or item, see who sells it nearby";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    line1: "Search a brand.",
    line2: "See who sells it.",
    subtitle: "Nearby clothing shops, mapped in 3D and sorted by distance.",
  });
}
