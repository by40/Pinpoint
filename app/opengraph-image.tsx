import { renderOgImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Pinpoint — Find clothes & brands in local shops";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    line1: "Find the clothes",
    line2: "you want, nearby.",
    subtitle: "Search a brand or item — see the local shops likely to sell it.",
  });
}
