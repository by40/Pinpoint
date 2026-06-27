import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Display face for headings — Space Grotesk has character without being loud.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Body face — Plus Jakarta Sans: clean, modern, friendlier than the default Inter.
// Only 400–700 are used (no font-extrabold), so 800 is dropped to trim payload.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Mono retained only as a small numeric/stat accent (kicker labels use 500).
const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pinpointapp.uk";
const DESCRIPTION =
  "Search a clothing brand or item and instantly see nearby shops likely to sell it — mapped in 3D, powered by community OpenStreetMap data. Free, no account needed.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pinpoint — Find clothes & brands in local shops",
    template: "%s · Pinpoint",
  },
  description: DESCRIPTION,
  applicationName: "Pinpoint",
  keywords: [
    "clothes near me",
    "where to buy clothes",
    "find a brand near me",
    "Nike near me",
    "local clothing shops",
    "fashion shops near me",
    "shoe shops near me",
    "vintage clothing shops",
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
    title: "Pinpoint — Find clothes & brands in local shops",
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinpoint — Find clothes & brands in local shops",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: "#6b2bf2",
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
    <html lang="en-GB" className={`${spaceGrotesk.variable} ${jakarta.variable} ${ibmMono.variable} antialiased`}>
      <head>
        {/* Without JS, Framer Motion's entry animations never run, leaving
            elements stuck at their initial opacity:0. Force them visible so
            content always renders for no-JS visitors and non-rendering crawlers. */}
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="font-sans">
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
