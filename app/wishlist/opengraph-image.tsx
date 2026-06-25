import { renderOgImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Pinpoint — Your whole outfit, found in one go";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    line1: "Your whole outfit,",
    line2: "found in one go.",
    subtitle: "Add every piece — Pinpoint maps the shops likely to sell each.",
  });
}
