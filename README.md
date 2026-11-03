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

Products use shareable `/products/<slug>-<id>` URLs. Product metadata and Product JSON-LD are set when the app loads; the Vercel functions provide a sitemap at `/sitemap.xml` and a crawler policy at `/robots.txt`. The sitemap includes the seeded products and, when Supabase environment variables are configured for the function, public products from the `products` table.

Set `VITE_SITE_URL` to the canonical production origin if the Vercel project production URL is not available to the functions. The SPA serves the same initial HTML for each route, so crawlers that do not execute JavaScript will not receive product-specific metadata in the initial response; prerendering or server-side rendering is needed for reliable social link previews.
