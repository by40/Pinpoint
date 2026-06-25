import { renderOgImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Pinpoint — Find local shops near you";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    line1: "Find what you need,",
    line2: "right nearby.",
    subtitle: "Type any item — see the local shops that sell it.",
  });
}
