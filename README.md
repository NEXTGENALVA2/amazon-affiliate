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

## Website chat, image, and voice messages

The website chat uses Vercel's `/api/chat` function and Supabase. To enable it:

1. Run [`supabase/chat-schema.sql`](./supabase/chat-schema.sql) in the Supabase SQL Editor. It creates private chat tables and a private `chat-attachments` bucket.
2. Configure these Vercel environment variables for the deployment:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never use a `VITE_` prefix)
   - `CHAT_ADMIN_USERNAME`
   - `CHAT_ADMIN_PASSWORD`
   - `CHAT_SESSION_SECRET` (random, at least 32 characters)
3. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set for the browser to upload using short-lived signed upload tokens.
4. Redeploy. Admin sign-in uses the server-configured credentials, and admin sessions are held in an HTTP-only cookie.

Customer messages are stored in Supabase and the admin inbox refreshes every five seconds. Images (JPG, PNG, WebP, GIF; up to 5 MB each) and voice recordings (up to 2 minutes / 12 MB) are stored in the private bucket and served through expiring signed URLs. The chat includes a `tel:` call link using the configured WhatsApp phone number. This is a regular phone call link; live in-browser voice/video calling requires a separate calling provider and credentials.

The same schema file also creates the private `storefront_settings` table used for social links and chat-header visibility. If you already ran an earlier version of the schema, run the current file again after deploying to add this table. Admins can then manage header visibility, built-in channel buttons, and up to eight custom profile links from **Admin → Social Accounts**. Settings are read publicly by the storefront and can only be changed from the authenticated admin session.

The Vite dev server provides local handlers for `/api/chat` and `/api/site-settings`, so `npm run dev` also supports admin sign-in. Add `CHAT_ADMIN_USERNAME`, `CHAT_ADMIN_PASSWORD`, and a random `CHAT_SESSION_SECRET` (at least 32 characters) to `.env.local`. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` there as well to test chat and social-settings persistence; keep the service-role key server-only. You can also use `vercel dev` to run the project with Vercel's local runtime.

## Product URLs and SEO

Products use shareable `/products/<slug>-<id>` URLs. Vercel rewrites product URLs to the SPA entry point so direct visits and browser reloads use the client router. Product metadata and Product JSON-LD are updated after the app loads. The Vercel functions also provide a sitemap at `/sitemap.xml` and crawler policy at `/robots.txt`. The sitemap includes seeded products and, when Supabase environment variables are configured for the function, public products from the `products` table.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel project's Production environment variables so the sitemap can include public products from Supabase. Without them, it uses the built-in seed catalog. Set `VITE_SITE_URL` to the canonical production origin if the Vercel project production URL is not available to its functions. Product metadata is client-rendered; reliable previews for crawlers that do not execute JavaScript require a separately verified server-side rendering or prerendering setup.
