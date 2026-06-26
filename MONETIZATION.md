# Pinpoint — Monetization notes

Parked for later. The site is a free, privacy-first local clothing/brand finder
(UK, SEO-driven, no live inventory). These are options for making money **once there
is real traffic** — not to build now.

> ⚠️ Figures below are rough ballparks and change over time — sanity-check current
> rates/thresholds when you actually act on this.

## The thing that gates everything: traffic
Every method here pays in proportion to visitors. With little traffic, ads earn
pennies and just make the site look worse. **Grow first (SEO/content), monetize once
there are a few thousand+ visits/month.** Two rules to keep regardless of method:

- **Keep the core search/map ad-free.** Only ever monetize the content pages
  (`/guides`, `/brand/[slug]`, `/clothes-shops/[city]`). Ads in a utility tool kill
  retention.
- **Ads and most affiliate tracking use cookies** → legally you'd need a **cookie
  consent banner (CMP)** for UK/EU and a **privacy-policy update**. That changes the
  current "no cookies, privacy-first" positioning — a real tradeoff, not just a
  toggle.

## Recommended sequence
1. **Now:** grow traffic (SEO — e.g. city×topic pages). Don't monetize yet.
2. **First money (works at lower traffic):** affiliate links.
3. **Once traffic is real (~tens of thousands of pageviews/mo):** display ads on
   content pages only + consent banner.
4. **Later / higher margin:** sponsored local shop listings.

---

## 1. Affiliate links — best first move ✅
The whole site is *purchase intent* (people looking for where to buy a brand), which
is exactly what affiliates pay for.

- **How:** link out to retailers (JD Sports, ASOS, End, Nike, etc.); earn commission
  on sales — fashion is typically **~5–12%**.
- **Networks:** AWIN (big for UK fashion), Rakuten, Amazon Associates, or
  auto-affiliate tools like Sovrn Commerce / Skimlinks (auto-convert outbound links).
- **Where:** a "Shop [brand] online" button on brand pages, and an affiliate "buy
  online" option alongside the local shop results.
- **Why first:** monetizes intent directly, earns at lower traffic than display ads,
  minimal UI clutter. Mild mission tension (online vs local) — offering both is fine.

## 2. Display ads — the "ads" option
- **How it works:** place ad slots on pages; a network fills them and pays per 1,000
  views (RPM) or per click.
- **Path:** Google **AdSense** to start (needs original content + privacy policy +
  approval) → **Ezoic** (low threshold) → **Mediavine / Raptive** (need ~50k–100k
  visits/mo, pay 2–4× AdSense).
- **Earnings ballpark:** UK retail AdSense ~**£2–£8 per 1,000 pageviews**. Only
  meaningful in the tens-of-thousands of pageviews range.
- **Catches:** content pages only (never the app); requires the consent banner +
  privacy update noted above.

## 3. Sponsored / featured local shops — best long-term margin
- Local shops pay to be a **"featured stockist"** (highlighted pin / top of list for
  their city or brand).
- Highest value per customer, but a **manual sales effort**. A later-stage play once
  you can show a shop "X people searched your brand in your city this month" (the
  analytics events added 2026-06-26 start building that evidence).

## Things to avoid
- Selling user data / location — kills the privacy positioning; not worth it.
- Paywalling the core finder — too thin a utility to charge for; would stall growth.
