import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await readFile("dist/index.html", "utf8");
const document = new JSDOM(html).window.document;
const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content;
assert.equal(document.documentElement.lang, "fr");
assert.equal(document.querySelectorAll("h1").length, 1);
assert.equal(document.querySelectorAll("meta[name=description]").length, 1);
assert.match(document.title, /Tirzah Café.*Matcha.*Paris/);
assert.match(meta("description"), /matcha à Paris/);
assert.equal(document.querySelectorAll("#root .product-card").length, 4);
assert.match(document.querySelector("#root").textContent, /Caramel Matcha/);
assert.match(document.querySelector("footer").textContent, /let's matcha/);
assert.equal(
  document.querySelector(".hero-photo").getAttribute("fetchpriority"),
  "high",
);
assert.ok(document.querySelector(".hero-photo").getAttribute("srcset"));
assert.ok(document.querySelector(".hero-photo").getAttribute("sizes"));
for (const image of document.querySelectorAll("img")) {
  assert.ok(image.getAttribute("width") && image.getAttribute("height"));
  assert.ok(existsSync("dist" + image.getAttribute("src")));
}
const robots = await readFile("dist/robots.txt", "utf8");
assert.ok(robots.includes("User-agent: *\nAllow: /"));
const canonical = document.querySelector('link[rel="canonical"]')?.href;
if (meta("robots").startsWith("index,")) {
  assert.ok(canonical?.startsWith("https://"));
  const xml = new JSDOM(await readFile("dist/sitemap.xml", "utf8"), {
    contentType: "application/xml",
  }).window.document;
  assert.equal(
    xml.documentElement.namespaceURI,
    "http://www.sitemaps.org/schemas/sitemap/0.9",
  );
  assert.equal(xml.querySelectorAll("url").length, 1);
  assert.equal(xml.querySelector("loc").textContent, canonical);
  assert.ok(robots.includes(`Sitemap: ${canonical}sitemap.xml`));
} else {
  assert.equal(meta("robots"), "noindex, nofollow");
  assert.equal(existsSync("dist/sitemap.xml"), false);
  assert.equal(robots.includes("Sitemap:"), false);
}
if (canonical) {
  assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(
    document.querySelector('meta[property="og:url"]').content,
    canonical,
  );
  assert.equal(
    document.querySelector('meta[property="og:image"]').content,
    canonical + "images/social-preview.jpg",
  );
  assert.equal(
    document.querySelector('meta[property="og:image:width"]').content,
    "1200",
  );
  const data = JSON.parse(
    document.querySelector('script[type="application/ld+json"]').textContent,
  );
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@graph"][0].url, canonical);
  assert.equal(data["@graph"][1].inLanguage, "fr-FR");
}
assert.equal(existsSync(".ssr"), false);
console.log(
  "SEO build verified: HTML content, images, robots, sitemap, canonical and JSON-LD.",
);
