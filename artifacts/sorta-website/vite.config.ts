import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

const _require = createRequire(import.meta.url);
const sectionMetaJson = _require("./section-meta.json") as {
  sections: Array<{
    route: string;
    title: string;
    description: string;
    ogImage: string;
    scrollTargetId: string | null;
  }>;
  baseUrl: string;
};

const SECTION_META_BY_ROUTE = Object.fromEntries(
  sectionMetaJson.sections.map((s) => [s.route, s]),
);

function injectOgMeta(
  html: string,
  section: (typeof sectionMetaJson.sections)[number],
  baseUrl: string,
): string {
  const canonicalUrl = `${baseUrl}${section.route}`;
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(section.title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${esc(section.description)}$2`,
    )
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
      `$1${esc(canonicalUrl)}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${esc(section.title)}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${esc(section.description)}$2`,
    )
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
      `$1${esc(canonicalUrl)}$2`,
    )
    .replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
      `$1${esc(section.ogImage)}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${esc(section.title)}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${esc(section.description)}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,
      `$1${esc(section.ogImage)}$2`,
    );
}

function perSectionOgPlugin(base: string): Plugin {
  const normalizeBase = base.endsWith("/") ? base.slice(0, -1) : base;

  return {
    name: "per-section-og-meta",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? "/";
        const pathname = rawUrl.split("?")[0];

        const strippedPath = pathname.startsWith(normalizeBase)
          ? pathname.slice(normalizeBase.length) || "/"
          : pathname;

        if (
          strippedPath.includes(".") ||
          strippedPath.startsWith("/api") ||
          strippedPath.startsWith("/@") ||
          strippedPath.startsWith("/__")
        ) {
          return next();
        }

        const section = SECTION_META_BY_ROUTE[strippedPath];
        if (!section) return next();

        try {
          const templatePath = path.resolve(import.meta.dirname, "index.html");
          const template = readFileSync(templatePath, "utf-8");
          const modified = injectOgMeta(template, section, sectionMetaJson.baseUrl);
          const html = await server.transformIndexHtml(rawUrl, modified);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch (e) {
          next(e);
        }
      });
    },
  };
}

export default defineConfig(async ({ command }) => {
  // PORT only matters for `vite` (dev) and `vite preview` — both report as
  // command "serve" — never for `vite build`, which doesn't bind a port.
  // Static hosts (e.g. Cloudflare Pages) build without setting PORT at all.
  let port: number | undefined;
  if (command === "serve") {
    const rawPort = process.env.PORT;
    if (!rawPort) {
      throw new Error(
        "PORT environment variable is required but was not provided.",
      );
    }
    port = Number(rawPort);
    if (Number.isNaN(port) || port <= 0) {
      throw new Error(`Invalid PORT value: "${rawPort}"`);
    }
  }

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      perSectionOgPlugin(basePath),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, ".."),
              }),
            ),
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
