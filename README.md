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

Products use shareable `/products/<title-slug>` URLs. Existing `/products/<slug>-<id>` links continue to resolve and are normalized to the canonical title-only URL in the browser. Vercel rewrites social preview crawler requests to a server-rendered metadata endpoint so each product shares its own title, description, and image. Product images hosted on the site or Supabase are rendered on a 1200x630 white canvas with extra margin around the product to prevent overly zoomed social thumbnails; external-hosted images use their original URL. Normal browser requests continue to load the SPA. The Vercel functions also provide a sitemap at `/sitemap.xml` and crawler policy at `/robots.txt`. The sitemap includes seeded products and, when Supabase environment variables are configured for the function, public products from the `products` table.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel project's Production environment variables so crawler previews and the sitemap can read public products from Supabase. Without them, the sitemap uses the built-in seed catalog but product-specific crawler previews cannot be generated. Set `VITE_SITE_URL` to the canonical production origin; it takes precedence over Vercel's default project domain for sitemaps and social previews.

## Buying guides and Pinterest

The public buying-guide index is `/blog`; article pages use stable `/blog/<slug>` URLs. Article content is rendered for Googlebot, Bingbot, Pinterest, and social preview crawlers, and each article URL is included in `/sitemap.xml`. These guides are general shopping information, disclose affiliate relationships, and do not claim independent testing.

`index.html` contains the Pinterest domain-verification meta tag from the current Pinterest claim flow. After deploying the site, open the exact production URL in Pinterest and choose **Claim website**. Add the Pinterest profile URL in **Admin → Social Accounts → Custom platforms** and save it to show the profile link on the storefront. If Pinterest issues a replacement verification tag, update the `p:domain_verify` content in `index.html`, redeploy, then retry the claim.

The Pinterest base tag is enabled with the supplied Tag ID and records page visits, including client-side route changes. It does not send the example email placeholder or perform enhanced matching. The ID and enable switch are also shown in **Admin → Pixel Tracking**; changing those settings is browser-local, so update the source default in `src/services/store.ts` when changing the tag for all visitors.

For search discovery, submit `https://<your-production-domain>/sitemap.xml` in Google Search Console and Bing Webmaster Tools after deployment. Verification, indexing, ranking, traffic, and sales are controlled by those services and cannot be guaranteed by the application.
