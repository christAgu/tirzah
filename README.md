# Tirzah Café

A mobile-first, French-language brand experience for a Parisian matcha café. React, TypeScript and Vite; no account, API key or backend required.

## Development

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:seo
```

## Included

- Filterable discovery menu, locally saved favorites
- Drink customization (milk, available temperature, quantity)
- Persistent local cart, editable quantities, item removal, copyable summary
- Two-question recommendation quiz
- Responsive navigation, accessible modal focus management, reduced-motion support
- Original café photos plus AI-created editorial campaign images inspired by them

## Before a real launch

This is a working **frontend concept**, not a real ordering service. Recipes and prices are proposals; the interface marks prices as indicative. Address, hours, contact details and official social links are intentionally unpublished until confirmed by the café. Milk alternatives do not guarantee a dairy-free drink: toppings and allergens need café verification.

No orders are transmitted and no payments are collected. Cart and favorites are stored in the current browser only; users can clear them from “À propos de cette démo”. Fonts load from Google Fonts. Generated imagery is disclosed in that dialog, and originals appear in “Notre mood”.

For production: validate product information and allergens, provide business/legal details, implement an ordering backend and payment provider if desired, and replace any unapproved campaign visuals. Deploy the built `dist` directory to any static host; this single-page app uses anchors, not route-based navigation.

## SEO and publication

`npm run build` now pre-renders the home page into HTML, then React hydrates it in the browser. Crawlers can read the menu, headings and brand content without executing JavaScript. Browser-only cart/favorites load after hydration without overwriting saved data.

The confirmed canonical origin is **https://tirzahcafe.com/** (without `www`). The tracked `.env.production` contains public SEO settings only, so `npm run build` generates the final sitemap automatically. Never put secrets in that file: use your hosting environment or an untracked `.env.production.local`. Those settings can override `SITE_URL` and `SITE_INDEXABLE`; see `.env.example`. Do not use a Devin preview URL as the canonical domain.

With `SITE_URL` configured, the production build includes:

- A self-referencing canonical URL, French Open Graph/Twitter metadata and a 1200×630 sharing image.
- Organization and WebSite JSON-LD using the real brand name, logo and public URL. No unconfirmed address, hours, prices, reviews or contact details are presented as structured facts. LocalBusiness rich-result markup should be added only after the café confirms its address/details.
- `/sitemap.xml` containing the sole canonical page. Anchors (`#la-carte`, `#notre-mood`) and interactive modals are not separate pages. No fabricated modification dates are emitted.
- `/robots.txt` allowing crawling and referencing that sitemap.

With an empty `SITE_URL` override, or with `SITE_INDEXABLE=false`, builds carry `noindex, nofollow` and omit the sitemap. Development, Vercel preview and Netlify deploy/branch previews are also non-indexable. Crawling remains allowed so Google can read the `noindex` directive; robots.txt alone is not an indexing or access-control guarantee. Use `SITE_INDEXABLE=false` for other staging hosts. Missing or malformed public origins are not replaced by an invented domain.

Performance improvements include responsive WebP hero imagery, explicit image dimensions, lazy loading below the fold, compressed original photos, a single Google Fonts stylesheet with `display=swap`, high-priority hero loading and Vite's minified, hashed production bundles. No visual redesign is required.

After deployment:

1. Ensure `/`, `/robots.txt` and `/sitemap.xml` return HTTP 200 with HTML, plain text and XML content types, respectively. Nonexistent paths must return a real 404, not the home-page HTML; configure your static host accordingly.
2. Redirect HTTP/alternate domains and `/index.html` to the single canonical URL; serve hashed assets with long-lived immutable caching, compress responses and revalidate HTML/robots/sitemap. These are hosting settings, not guarantees of this frontend.
3. Verify the domain property in Google Search Console, submit `sitemap.xml` and inspect/request indexing of the home page.
4. Validate JSON-LD with Google's Rich Results Test, and measure real deployment performance with PageSpeed Insights/Search Console. A sitemap helps discovery but does not guarantee indexing or rankings.
