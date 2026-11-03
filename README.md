<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6b077d48-0efe-4cda-aed0-4364ea6eae56

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# amazon-affiliate

## Product URLs and SEO

Products use shareable `/products/<slug>-<id>` URLs. Vercel rewrites product URLs to the SPA entry point so direct visits and browser reloads use the client router. Product metadata and Product JSON-LD are updated after the app loads. The Vercel functions also provide a sitemap at `/sitemap.xml` and crawler policy at `/robots.txt`. The sitemap includes seeded products and, when Supabase environment variables are configured for the function, public products from the `products` table.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel project's Production environment variables so the sitemap can include public products from Supabase. Without them, it uses the built-in seed catalog. Set `VITE_SITE_URL` to the canonical production origin if the Vercel project production URL is not available to its functions. Product metadata is client-rendered; reliable previews for crawlers that do not execute JavaScript require a separately verified server-side rendering or prerendering setup.
