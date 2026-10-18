# HANNON SEO, indexing and Search Console guide

Canonical origin: **https://hannoninterinvest.com** (no `www`).
Everything below describes what is implemented in the repository and what the site owner still has to do manually. Nothing here guarantees rankings, sitelinks, rich results or a Knowledge Panel: those are decided by search engines.

## What is implemented

| Area | Where |
| --- | --- |
| Site constants (origin, name, address, tagline, sectors) | `lib/seo.ts` |
| Root metadata (title template, default title, Open Graph, Twitter, icons, manifest, robots) | `app/layout.tsx` |
| Per-page metadata helper (title, description, canonical, OG, Twitter) | `pageMetadata()` in `lib/seo.ts` |
| Dynamic metadata from the database | `app/projects/[id]/page.tsx`, `app/services/[slug]/page.tsx` (`generateMetadata`) |
| JSON-LD builders (Organization, WebSite, BreadcrumbList, Service, WebPage) | `lib/seo.ts`, rendered by `components/JsonLd.tsx` |
| Sitemap (static pages + published services + visible projects) | `app/sitemap.ts` -> `/sitemap.xml` |
| robots.txt | `app/robots.ts` -> `/robots.txt` |
| Web app manifest | `app/manifest.ts` -> `/manifest.webmanifest` |
| noindex for private areas (`/admin`, `/login`, `/register`, `/dashboard`) | `app/*/layout.tsx` (meta robots) and `X-Robots-Tag` in `next.config.js` |
| noindex for `*.vercel.app` aliases and for previews | `next.config.js` headers, `INDEXABLE` in `lib/seo.ts`, `robots.ts` |
| `www` -> apex permanent redirect | `vercel.json` |
| Favicons, Apple touch icon, PWA icons, 1200x630 social preview | `public/` |
| Company presentation (visible, in the homepage HTML) | `components/AboutSection.tsx`, `/about` |

Public pages (`/`, `/services`, `/services/[slug]`, `/projects`, `/projects/[id]`) are rendered on the server, so crawlers receive the real content in the first HTML response.

### Logo assets

All icons are derived from the official helmet symbol in `public/logoha.webp` (cropped to its bounding box, same colors and proportions, no redesign). The symbol has no text, so the same artwork is used at every size. `apple-touch-icon.png` sits on the brand navy (#0a1a30) because iOS does not support transparency. If the official logo is ever replaced, regenerate `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon.png`, `icon-192.png`, `icon-512.png` and `og-image.jpg`.

### Structured data

Organization and WebSite are only on the homepage. BreadcrumbList is on every public sub-page and matches the visible breadcrumb. Service is on service pages. Project pages use a plain WebPage (title, summary, sector, location, image): no financial data, ratings, reviews or offers are published in markup.

`sameAs` is intentionally **absent**. The footer LinkedIn button is still a placeholder (`href="#"`). When a genuine, verified official profile exists, add it to `organizationJsonLd()` in `lib/seo.ts`:

```ts
sameAs: ["https://www.linkedin.com/company/<official-page>"],
```

### Indexing decisions

- `robots.txt` blocks `/admin`, `/api/` and `/dashboard`.
- `/login` and `/register` are deliberately **not** blocked in robots.txt: a page blocked by robots.txt cannot be fetched, so Google would never see its `noindex`. They carry `noindex, nofollow` (meta and header).
- Authentication and authorization are still enforced by the application; robots rules and noindex are not access control.
- Draft services and hidden projects return 404 on public URLs and are never in the sitemap.
- Query-string variants (for example `/contact?type=interest&project=...`) point their canonical to the clean URL.
- Preview deployments (`VERCEL_ENV=preview`) answer `Disallow: /` and `noindex`; any `*.vercel.app` host also gets `X-Robots-Tag: noindex`.

## Vercel domain setup (owner action)

1. Vercel project -> Settings -> Domains: add `hannoninterinvest.com` and set it as the **Production** domain.
2. Add `www.hannoninterinvest.com` as well. `vercel.json` already redirects it to the apex with a 308. (Alternatively set the redirect in the Domains screen; do not configure both differently.)
3. HTTP is redirected to HTTPS automatically by Vercel.
4. Do not set `NEXT_PUBLIC_SITE_URL` or similar: the origin is a constant in `lib/seo.ts`.

## Google Search Console (owner action, not done yet)

Search Console verification and sitemap submission have **not** been performed. The code cannot do them; they need the owner's Google account and DNS access.

1. Open https://search.google.com/search-console and choose **Add property** -> **Domain**. Enter `hannoninterinvest.com`. A Domain property covers `www`, non-www, HTTP and HTTPS.
2. Verify with **DNS**: Google shows a `TXT` record (`google-site-verification=...`). Add it at the DNS provider of the domain (Vercel DNS if the nameservers are Vercel's, otherwise the registrar), wait for propagation, then press **Verify**. Keep the record permanently.
3. **Sitemaps** -> enter `sitemap.xml` -> **Submit**. Expect status "Success" and the discovered page count.
4. **URL inspection**: paste `https://hannoninterinvest.com/` and read the result (indexed or not, selected canonical, detected structured data, rendered HTML).
5. If the page is not indexed, press **Request indexing**. Repeat for `/about`, `/services`, `/projects` and the most important project and service pages. Quota is limited; this is a nudge, not a guarantee.
6. Monitor: **Pages** (indexing coverage and exclusion reasons), **Performance** (queries, clicks, impressions, CTR, position), **Enhancements** (breadcrumbs), **Core Web Vitals** and **Experience**. Check weekly for the first month.

Optional: if a URL-prefix property is preferred, an HTML-tag verification can be added through `metadata.verification.google` in `app/layout.tsx`; the DNS method above is recommended.

## Post-deploy verification checklist

- `https://hannoninterinvest.com/robots.txt` and `/sitemap.xml` return 200.
- `https://www.hannoninterinvest.com/anything` answers 308 to `https://hannoninterinvest.com/anything`.
- `https://hannoninterinvest.com/favicon.ico`, `/apple-touch-icon.png`, `/icon-192.png`, `/og-image.jpg` return 200.
- Rich Results Test (https://search.google.com/test/rich-results) and Schema Markup Validator (https://validator.schema.org) on the homepage and one service page.
- Social previews: Facebook Sharing Debugger, LinkedIn Post Inspector, WhatsApp (send the link to yourself). These platforms cache previews; use their "scrape again" tools after changes.
- PageSpeed Insights on `/`, `/services` and one project page (mobile).
- `curl -I https://hannoninterinvest.com/admin` shows `X-Robots-Tag: noindex`.

## Business identity (owner action, optional)

Name, address, phone and email are identical in the footer, the About section, the Organization JSON-LD and the contact page:

HANNON INTERNATIONAL INVESTMENTS, Immeuble Saadi, Tour EF, Menzah 4, Tunis 1082, Tunisia. contact@hannoninterinvest.com, +216 56 147 900.

A Google Business Profile can reinforce the brand for local searches, but it requires the owner to claim and verify it (postcard, phone or video). Nothing was registered automatically. Keep every external listing identical to the data above.

## Recommended next steps

1. Publish real, useful content: at least 3 to 5 detailed projects and one page per service with a descriptive intro, so each page has unique text.
2. Add one page per focus sector (energy, healthcare, agriculture, AI, trade) once there is real content to put on it.
3. Replace UUID project URLs with readable slugs (`/projects/<slug>`) with a permanent redirect from the old URL.
4. Replace placeholder footer links (LinkedIn, Privacy Policy, Terms of Use, Legal Notice) with real pages and profiles; legal pages build trust.
5. Add descriptive `alt` text when uploading images in the admin.
6. Earn genuine links: partner websites, chambers of commerce, press releases, LinkedIn company page. Do not buy links.
7. Consider ISR with on-demand revalidation after admin changes to reduce server time on public pages.
8. Add a French version (`/fr`) with `hreflang` for searches such as "HANNON Investissements".
