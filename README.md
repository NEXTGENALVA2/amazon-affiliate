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

## Admin login and social links

The customer chat widget and inbox have been removed. Admin sign-in uses the separate `/api/admin-auth` endpoint.

Set these server-only variables in Vercel (Production) and redeploy:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` (use a strong, unique password)
- `ADMIN_SESSION_SECRET` (random, at least 32 characters)

For backwards compatibility, the previous `CHAT_ADMIN_USERNAME`, `CHAT_ADMIN_PASSWORD`, and `CHAT_SESSION_SECRET` names are still accepted.

Admins can manage enabled social profiles from **Admin → Social Accounts**. To save those links across devices, run [`supabase/site-settings.sql`](./supabase/site-settings.sql) in the Supabase SQL Editor and set `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Keep the service-role key server-only.

For local development, add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` to `.env.local`; the Vite dev server provides local handlers for admin authentication and social settings.

## Product URLs and SEO

Products use shareable `/products/<slug>-<id>` URLs. Vercel rewrites product URLs to the SPA entry point so direct visits and browser reloads use the client router. Product metadata and Product JSON-LD are updated after the app loads. The Vercel functions also provide a sitemap at `/sitemap.xml` and crawler policy at `/robots.txt`. The sitemap includes seeded products and, when Supabase environment variables are configured for the function, public products from the `products` table.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel project's Production environment variables so the sitemap can include public products from Supabase. Without them, it uses the built-in seed catalog. Set `VITE_SITE_URL` to the canonical production origin if the Vercel project production URL is not available to its functions. Product metadata is client-rendered; reliable previews for crawlers that do not execute JavaScript require a separately verified server-side rendering or prerendering setup.
