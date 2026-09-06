// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// Deployment configuration.
//
// GitHub Pages (project site, the default): the site is served from a subpath
// that matches the repo name, e.g. https://<org>.github.io/synergy-website/.
// That is why `base` is set below. If you deploy to a custom domain or to
// Cloudflare Pages (which serves from the root), set `base: '/'` and update
// `site` to your final URL. All internal links use `import.meta.env.BASE_URL`
// (via src/utils/url.ts), so changing these two values is all that's required.
export default defineConfig({
  site: "https://ou-synergy.github.io",
  base: "/",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  integrations: [
    // applyBaseStyles: false — we own the @tailwind directives in
    // src/styles/global.css so we can add custom @layer base/components rules.
    tailwind({ applyBaseStyles: false }),
  ],
  vite: {
    server: {
      watch: { usePolling: true, interval: 300 },
    },
  },
});
