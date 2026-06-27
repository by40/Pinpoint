# Pinpoint — Services & accounts reference

Everything this website depends on, and where to manage it. Personal reference —
kept local (not committed). Last updated 2026-06-26.

Site: **https://pinpointapp.uk**

---

## Hosting & code
| Service | What it does | Account / location |
|---|---|---|
| **Vercel** | Hosts & deploys the site; auto-deploys on every push to `main`. Also serves Analytics + Speed Insights. | Vercel dashboard → the Pinpoint project |
| **GitHub** | Source code repository. | `github.com/by40/Pinpoint` (logged in as `by40`), branch `main` |

**Vercel environment variables** (Settings → Environment Variables, set for **Production**):
- `NEXT_PUBLIC_SITE_URL` = `https://pinpointapp.uk`
- `SITE_LOCKED` = `true` (the pre-release password gate; set to `false` to go public)
- `SITE_PASSWORD` = your chosen preview password
- `GATE_TOKEN` = long random string (the auth cookie value)

To deploy: push to `main` (or Redeploy in Vercel). Env-var changes need a redeploy.

---

## Domain & DNS
| Service | What it does | Account / location |
|---|---|---|
| **GoDaddy** | Domain registrar + DNS host for pinpointapp.uk. | GoDaddy → My Products → Domains → pinpointapp.uk → DNS |

**Key DNS records:**
- `A` `@` → `76.76.21.21` (points the site to Vercel)
- `CNAME` `www` → `cname.vercel-dns.com`
- `MX` `@` → `mx1.improvmx.com` (pri 10), `mx2.improvmx.com` (pri 20) — email forwarding
- `TXT` `@` → `v=spf1 include:spf.improvmx.com ~all` (SPF for email)
- `TXT` `_dmarc` → GoDaddy default DMARC (harmless)

---

## Email
| Service | What it does | Account / location |
|---|---|---|
| **ImprovMX** | Free email forwarding for the domain. | improvmx.com dashboard |
| **Gmail** | Where forwarded mail lands. | cjay7891@gmail.com |

Forwarding: **info@pinpointapp.uk → cjay7891@gmail.com** (plus a `*` catch-all).
Receiving is free; *sending* as info@ would need ImprovMX's paid SMTP add-on.

---

## SEO / search
| Service | What it does | Account / location |
|---|---|---|
| **Google Search Console** | Indexing, sitemap, search performance. | search.google.com/search-console |

- Verified via the file `public/google4172a2c1ad8a831a.html` — **do NOT delete it** (Google re-checks it).
- Sitemap submitted: `https://pinpointapp.uk/sitemap.xml`.
- (Not yet set up: Bing Webmaster Tools — optional, imports from Google in 2 clicks.)

---

## Map & data (no account needed — free public APIs)
| Service | What it does |
|---|---|
| **OpenStreetMap / Overpass API** | The shop data (brands, shop types). Queried live via public Overpass mirrors. No live inventory — results are "likely" stockists. |
| **Nominatim** | Geocoding — turns a typed town/postcode into coordinates. |
| **OpenFreeMap** | The 3D map tiles. |
| **MapLibre GL** | The map rendering library (in the app itself). |

---

## Analytics
| Service | What it does | Account / location |
|---|---|---|
| **Vercel Web Analytics** | Privacy-friendly (cookieless) page + custom event tracking (searches, filters, directions, etc.). | Vercel project → Analytics tab |
| **Vercel Speed Insights** | Core Web Vitals / performance monitoring. | Vercel project → Speed Insights tab |

---

## Fonts (free, via Google Fonts / next/font — no account)
- **Space Grotesk** (display / headings)
- **Plus Jakarta Sans** (body)
- **IBM Plex Mono** (small mono accents / kicker labels)

---

## Quick "where do I go to…" cheat sheet
- **Change site content / deploy** → edit code, push to GitHub `main` → Vercel deploys.
- **Take the site public** → Vercel env var `SITE_LOCKED=false` → Redeploy.
- **Change the contact email destination** → ImprovMX dashboard.
- **Check who's visiting / what they search** → Vercel → Analytics.
- **DNS / domain renewal** → GoDaddy.
- **Search ranking / submit pages** → Google Search Console.
