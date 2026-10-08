import type { Plugin } from "vite";

export const seo = {
  title: "Tirzah Café | Matcha & café à Paris",
  description:
    "Découvrez Tirzah Café, l’univers du matcha à Paris : boissons signatures, matcha latte et café gourmand. Trouvez votre matcha mood.",
};

export function normalizeSiteUrl(value?: string) {
  if (!value?.trim()) return null;
  const url = new URL(value.trim());
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    url.port ||
    !url.hostname.includes(".") ||
    /^(localhost|127\.|0\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
      url.hostname,
    ) ||
    url.hostname.endsWith(".localhost")
  ) {
    throw new Error(
      "SITE_URL doit être un domaine HTTPS public, sans chemin, paramètres ni identifiants.",
    );
  }
  return url.origin + "/";
}

export function createSeoAssets(siteUrl: string | null, indexable: boolean) {
  const canIndex = Boolean(siteUrl) && indexable;
  const robots =
    "User-agent: *\nAllow: /\n" +
    (canIndex ? `\nSitemap: ${siteUrl}sitemap.xml\n` : "");
  const sitemap = canIndex
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}</loc></url>\n</urlset>\n`
    : null;
  return {
    robots,
    sitemap,
    robotsMeta: canIndex
      ? "index, follow, max-image-preview:large"
      : "noindex, nofollow",
  };
}

export function createSeoPlugin(
  siteUrl: string | null,
  indexable: boolean,
): Plugin {
  const assets = createSeoAssets(siteUrl, indexable);
  let ssr = false;
  return {
    name: "tirzah-seo",
    configResolved(config) {
      ssr = Boolean(config.build.ssr);
    },
    transformIndexHtml() {
      const tags = [
        { tag: "meta", attrs: { name: "robots", content: assets.robotsMeta } },
        { tag: "meta", attrs: { property: "og:type", content: "website" } },
        { tag: "meta", attrs: { property: "og:locale", content: "fr_FR" } },
        {
          tag: "meta",
          attrs: { property: "og:site_name", content: "Tirzah Café" },
        },
        { tag: "meta", attrs: { property: "og:title", content: seo.title } },
        {
          tag: "meta",
          attrs: { property: "og:description", content: seo.description },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:card", content: "summary_large_image" },
        },
        { tag: "meta", attrs: { name: "twitter:title", content: seo.title } },
        {
          tag: "meta",
          attrs: { name: "twitter:description", content: seo.description },
        },
      ];
      if (!siteUrl) return tags;
      const image = new URL("images/social-preview.jpg", siteUrl).href;
      return [
        ...tags,
        { tag: "link", attrs: { rel: "canonical", href: siteUrl } },
        { tag: "meta", attrs: { property: "og:url", content: siteUrl } },
        { tag: "meta", attrs: { property: "og:image", content: image } },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        {
          tag: "meta",
          attrs: {
            property: "og:image:alt",
            content: "Tirzah Café, matcha et latte au caramel",
          },
        },
        { tag: "meta", attrs: { name: "twitter:image", content: image } },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image:alt",
            content: "Tirzah Café, matcha et latte au caramel",
          },
        },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": siteUrl + "#organization",
                name: "Tirzah Café",
                url: siteUrl,
                logo: new URL("images/original-logo.jpg", siteUrl).href,
                description: seo.description,
              },
              {
                "@type": "WebSite",
                "@id": siteUrl + "#website",
                name: "Tirzah Café",
                url: siteUrl,
                inLanguage: "fr-FR",
                publisher: { "@id": siteUrl + "#organization" },
              },
            ],
          }).replace(/</g, "\\u003c"),
        },
      ];
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/robots.txt") return next();
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(assets.robots);
      });
    },
    generateBundle() {
      if (ssr) return;
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: assets.robots,
      });
      if (assets.sitemap)
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: assets.sitemap,
        });
    },
  };
}
