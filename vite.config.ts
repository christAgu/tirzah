import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createSeoPlugin, normalizeSiteUrl } from "./seo";

export default defineConfig(({ mode, command }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const siteUrl = normalizeSiteUrl(env.SITE_URL);
  if (env.SITE_INDEXABLE && !["true", "false"].includes(env.SITE_INDEXABLE)) {
    throw new Error("SITE_INDEXABLE doit valoir true ou false.");
  }
  const indexable =
    command === "build" &&
    mode === "production" &&
    env.SITE_INDEXABLE !== "false" &&
    env.VERCEL_ENV !== "preview" &&
    !["deploy-preview", "branch-deploy"].includes(env.CONTEXT ?? "");
  return {
    plugins: [react(), createSeoPlugin(siteUrl, indexable)],
    test: {
      environment: "jsdom",
      setupFiles: "./src/test-setup.ts",
      css: false,
      restoreMocks: true,
    },
  };
});
