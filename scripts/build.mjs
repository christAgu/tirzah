import { readFile, writeFile, rm } from "node:fs/promises";
import { build } from "vite";

try {
  await build();
  await build({
    build: {
      ssr: "src/entry-server.tsx",
      outDir: ".ssr",
      copyPublicDir: false,
    },
  });
  const { render } = await import("../.ssr/entry-server.js");
  const html = await readFile("dist/index.html", "utf8");
  if (!html.includes('<div id="root"></div>')) {
    throw new Error(
      "Impossible de pré-rendre la page : conteneur React introuvable.",
    );
  }
  await writeFile(
    "dist/index.html",
    html.replace(
      '<div id="root"></div>',
      () => `<div id="root">${render()}</div>`,
    ),
  );
  console.log(
    "HTML pré-rendu : la carte et les textes sont lisibles sans JavaScript.",
  );
} finally {
  await rm(".ssr", { recursive: true, force: true });
}
