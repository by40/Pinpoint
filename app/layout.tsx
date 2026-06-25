import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pinpointapp.uk";
const DESCRIPTION =
  "Search for any item and instantly see nearby shops that sell it — mapped in 3D, powered by community OpenStreetMap data. Free, no account needed.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pinpoint — Find local shops near you",
    template: "%s · Pinpoint",
  },
  description: DESCRIPTION,
  applicationName: "Pinpoint",
  keywords: [
    "local shops",
    "shop finder",
    "find shops near me",
    "nearby stores",
    "where to buy",
    "independent shops",
    "OpenStreetMap",
  ],
  authors: [{ name: "Pinpoint" }],
  creator: "Pinpoint",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Pinpoint",
    url: SITE_URL,
    title: "Pinpoint — Find local shops near you",
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinpoint — Find local shops near you",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: "#F7F6F3",
  colorScheme: "light",
};

// Sitewide structured data — Organization + WebSite (with a search action so
// Google can offer a sitelinks search box).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Pinpoint",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Pinpoint",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${ibmMono.variable} antialiased`}>
      <body className="font-mono">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
