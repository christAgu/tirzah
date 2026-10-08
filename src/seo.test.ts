import { describe, expect, it } from "vitest";
import type { IndexHtmlTransformContext } from "vite";
import {
  createSeoAssets,
  createSeoPlugin,
  normalizeSiteUrl,
  seo,
} from "../seo";

describe("SEO configuration", () => {
  it("normalizes the public canonical origin without inventing a domain", () => {
    expect(normalizeSiteUrl()).toBeNull();
    expect(normalizeSiteUrl("  ")).toBeNull();
    expect(normalizeSiteUrl(" https://www.tirzah.example ")).toBe(
      "https://www.tirzah.example/",
    );
  });

  it.each([
    "http://tirzah.example",
    "https://localhost",
    "https://127.0.0.1",
    "https://192.168.1.10",
    "https://172.16.0.1",
    "https://tirzah.example/menu",
    "https://tirzah.example/?preview=true",
    "https://tirzah.example/#la-carte",
    "https://user:password@tirzah.example",
    "https://tirzah.example:5173",
    "not a URL",
  ])("rejects invalid production origins: %s", (url) => {
    expect(() => normalizeSiteUrl(url)).toThrow();
  });

  it("emits only the canonical page in the sitemap and references it in robots", () => {
    const assets = createSeoAssets("https://tirzah.example/", true);
    const xml = new DOMParser().parseFromString(
      assets.sitemap!,
      "application/xml",
    );
    expect(xml.querySelector("parsererror")).toBeNull();
    expect(xml.querySelectorAll("url")).toHaveLength(1);
    expect(xml.querySelector("loc")?.textContent).toBe(
      "https://tirzah.example/",
    );
    expect(xml.querySelector("lastmod")).toBeNull();
    expect(assets.robots).toContain(
      "Sitemap: https://tirzah.example/sitemap.xml",
    );
    expect(assets.robotsMeta).toContain("index, follow");
  });

  it.each([
    [null, true],
    ["https://tirzah.example/", false],
  ] as const)(
    "keeps unconfigured/preview builds non-indexable while allowing noindex to be read",
    (url, indexable) => {
      const assets = createSeoAssets(url, indexable);
      expect(assets.robotsMeta).toBe("noindex, nofollow");
      expect(assets.sitemap).toBeNull();
      expect(assets.robots).toBe("User-agent: *\nAllow: /\n");
    },
  );

  it("generates absolute social/canonical URLs and factual JSON-LD", async () => {
    const hook = createSeoPlugin(
      "https://tirzah.example/",
      true,
    ).transformIndexHtml;
    if (typeof hook !== "function") throw new Error("Missing SEO HTML hook");
    const tags = await hook("", {} as IndexHtmlTransformContext);
    if (!Array.isArray(tags)) throw new Error("Missing SEO tags");
    expect(tags.find((t) => t.attrs?.rel === "canonical")?.attrs?.href).toBe(
      "https://tirzah.example/",
    );
    expect(
      tags.find((t) => t.attrs?.property === "og:title")?.attrs?.content,
    ).toBe(seo.title);
    expect(
      tags.find((t) => t.attrs?.property === "og:image")?.attrs?.content,
    ).toBe("https://tirzah.example/images/social-preview.jpg");
    const data = JSON.parse(
      tags.find((t) => t.tag === "script")!.children as string,
    );
    expect(
      data["@graph"].map((entry: { "@type": string }) => entry["@type"]),
    ).toEqual(["Organization", "WebSite"]);
    expect(data["@graph"][0].name).toBe("Tirzah Café");
    expect(JSON.stringify(data)).not.toMatch(
      /address|openingHours|aggregateRating|offers/,
    );
  });
});
