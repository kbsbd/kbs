# KBS — Next.js site + admin CMS

A Next.js (App Router) rebuild of the KBS real estate site: a lean, fast
public homepage/properties section backed by Supabase, plus an admin
dashboard for editing content without touching code.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Supabase** — Postgres content storage + Auth (single admin user)
- **Cloudinary / YouTube** — hero video and "Statement of Arrival" video are
  just URLs/IDs stored in Supabase; no API keys needed for either
- Deploy target: **Vercel**

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase values (see below)
npm run dev
```

The site runs and looks correct **without** Supabase configured — every
public page falls back to bundled demo data (`lib/data/properties.js`,
`lib/data/site.js`, `lib/data/footer.js`). `/admin` shows a "Supabase isn't
configured yet" message instead of crashing.

## Connecting Supabase

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`.
3. Copy the project's **Project URL** and **anon public key** (Settings →
   API) into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
4. Create the admin account: Authentication → Users → Add user (email +
   password). This is the only account with dashboard access — there's no
   public sign-up flow. Any authenticated user is treated as admin
   (single-tenant model), so only create accounts you trust.
5. (Optional) Seed the real property data instead of relying on the code
   fallback: insert rows into `properties` matching the shape in
   `lib/data/properties.js`, and a row into `site_settings` (`id = 1`) for
   the hero video/YouTube ID/integration IDs.
6. Restart the dev server. `/admin/login` will now work.

## Admin dashboard (`/admin`)

- **Hero & Video** — Cloudinary hero video URL + poster image
- **Statement of Arrival** — YouTube URL/ID for the homepage video section
- **Properties** — full CRUD (the property cards across the site read from
  this table)
- **Legal Pages** — edits the plain-text content at `/legal/[slug]`
- **Footer & Social** — footer links and social icons
- **Integrations** — Meta Pixel ID / GA4 Measurement ID (only injected when
  set, loaded after the page is interactive)
- **Profile** — change the admin's email/password

Leads from the "I am interested in this property" form and newsletter
signups are stored in the `leads` and `newsletter_subscribers` tables
(viewable via the Supabase table editor for now).

## Performance / SEO / accessibility

- `app/robots.js` explicitly allows common AI/LLM crawlers (GPTBot,
  ClaudeBot, PerplexityBot, Google-Extended, etc.) alongside `*`.
- `app/sitemap.js` lists every property page.
- `public/llms.txt` gives crawling agents a plain-text summary of the site.
- Every property page carries `Residence` JSON-LD; the root layout carries
  `RealEstateAgent`/`WebSite` JSON-LD.
- No jQuery/Bootstrap/Font Awesome/legacy WordPress plugin JS — interactive
  bits (mobile menu, carousels, lightboxes, YouTube facade) are small
  hand-written React, not inherited plugin bundles.
- Last local Lighthouse pass (production build, default mobile throttling):
  Accessibility 100, SEO 100, Best Practices 96, Performance 77. The
  remaining performance headroom is React/Next's client-runtime cost under
  Lighthouse's 4x CPU throttling, not a specific bug — worth another pass if
  you want to push further (e.g. converting more sections to pure Server
  Components).

## Deploying

```bash
git push                 # once a GitHub remote is set
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SITE_URL   # your production domain
vercel deploy --prod
```

## Pages

Converted from the real source mirrors in the sibling folders: `/` (home),
`/properties` (listing), `/property/[slug]` (detail — gallery, floor plans,
optional property video, spec table, static map, interest form), `/about`,
`/contact`, `/nrb`, `/landowner` (incl. FAQ accordion), `/construction-status/[slug]`,
`/legal/[slug]`.

## What's not built yet

Gallery, Blog, Career, Handed-over Projects, and the Referral program (a
separate subdomain/design, `campaign.btibd.com`) — no source mirror was
provided for these yet.
