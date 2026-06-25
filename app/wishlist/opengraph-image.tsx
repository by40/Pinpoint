import { renderOgImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Pinpoint — Your shopping list, found in one go";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    line1: "Your shopping list,",
    line2: "found in one go.",
    subtitle: "Add everything you need — Pinpoint maps shops for all of it.",
  });
}
