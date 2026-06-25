import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pinpoint — Find local shops near you",
    short_name: "Pinpoint",
    description: "Search any item and discover nearby shops that sell it, mapped in 3D.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F6F3",
    theme_color: "#F7F6F3",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
