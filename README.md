# SPE Java

Full-site Doop redesign on React, TypeScript and Vite, with Cloudflare Pages Functions and Sanity. All 34 observed Framer URLs are preserved within 47 public routes. Source content and local images are retained under `content/` and `public/media/`.

**Review only. Do not change spejava.com DNS or cancel Framer before SPE Java approves the migration.**

## Develop and verify

Node 22.12 or later is required.

```sh
npm ci
npm ci --prefix studio
npm run dev
npm run check
npm --prefix studio run check
npm test
npm run build
```

The build validates the portable content, prerenders every known route, writes route-specific metadata and a sitemap, and builds the browser editor when a Sanity project is configured. `npm run preview` previews the static snapshot, not Pages Functions. To exercise the full runtime locally after building:

```sh
npx wrangler pages dev dist
```

Use `npm run types:worker` after changing Wrangler bindings. No pre-commit hooks are currently configured.

## Sanity setup

The review uses SPE Java Section project `q8u3iykd` and its public `production` dataset. The self-hosted Studio and schema registry are configured; API credentials are never included in the website.

1. Reuse an SPE-owned project, or create one at https://www.sanity.io/manage with a public dataset named `production`. Only public website content belongs in this dataset, never registrations or private member information.
2. Put the public Project ID/dataset into the default and preview `vars` in `wrangler.jsonc`. The website needs no read token. Build-time `SANITY_PROJECT_ID` / `SANITY_DATASET` overrides must match the runtime bindings.
3. Add exact permitted editor origins in Sanity's API → CORS origins with credentials enabled: `https://redesign.spejava.pages.dev`, `https://spejava.pages.dev`, and `http://localhost:3333` when developing Studio locally. Add `https://spejava.com` only as part of an approved production rollout. No wildcard credential origins.
4. Run `npm run cms:export` to create `studio/migration.ndjson`. It contains 40 deterministic root-namespace records (no dots in public IDs), proper Portable Text, original source copy and locked legacy slugs. Import with **create-if-absent** semantics, never replace existing editorial changes. An authorized Sanity MCP integration can create the records; the authenticated CLI equivalent is `sanity dataset import migration.ndjson production --missing` from `studio/`. Inspect the existing dataset before importing.
5. Rebuild and deploy the review branch. Studio is self-hosted at `/admin/` using native Sanity authentication; it requires no GitHub app, custom OAuth service or separate Studio-hosting token. Invite only authorized SPE editors using the roles available on the selected Sanity plan.

Unconfigured deployments deliberately show the portable snapshot and an explicit editor setup-pending page. A configured CMS outage fails with a retryable 503 rather than silently republishing old snapshot content.

Published documents are fetched through a fixed published-only GROQ query; draft/version IDs are excluded, and the public request sends no auth token. Validated published content is cached for 60 seconds, in addition to Sanity CDN freshness. **Publishing content needs no site rebuild, deploy hook, or Cloudflare token.**

Existing images remain owned static assets with provenance. Replacing a photo in Studio uploads its replacement to Sanity. Original Markdown is retained in hidden migration fields; the editor exposes Portable Text instead of raw Markdown.

## Editorial workflow and safety

- Stories and events: enter confirmed facts, summary, date, language, image alt and content. Clear the editorial-review flag only after approval. Migrated stock/sample records remain marked for review, excluded from listings and search.
- Existing URL identifiers are locked; validation also prevents renaming a published new document. Deliberate unpublishing/deletion removes its public page.
- Event registration requires a confirmed date and approved URL. Past events close automatically; a future event with closed registration is still an upcoming event, not an archive item.
- AES and scholarships retain historical announcements. Add future application rounds as programme editions with confirmed opening/closing dates (Asia/Jakarta), an approved URL and explicit open status. Outside that window no open application button is shown.
- Edition supporters appear only when explicitly approved for that edition. Unknown counts, leadership terms, fees, schedules and contacts remain visibly TBC.
- Contact/newsletter submission stays disabled until SPE approves a backend and privacy/anti-spam handling. Historical Google Forms/workshop invitations are not current registrations.

## Motion and assets

The neutral ASCII earth sits directly on bone with Indonesia in SPE blue. Click/tap the globe or use Enter/Space to pause/resume; no visible caption or Pause footer remains. It stops offscreen/in background tabs and freezes under reduced motion. The same renderer generates the complete static no-JS frame during the build. Geography is derived from public-domain [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) data supplied in the design handoff. Glyph dividers and arrow feedback remain in place. The header is sticky on every page; menus, skip links and anchors retain clearance.

Designer’s v3 text streams from 0–100% with a four-character alphanumeric tail, using final glyph rectangles without changing source layout. Designer’s v5 images in view reveal concurrently: each in-view image runs the real Libraries.dev `pixels-mechanic` GPU dissolve from img-fx, tuned from the stock ~2.6s down to 0.85s at 30fps, and every image starts the moment it enters the viewport (no queue, no waiting for the previous one). All instances share one WebGL renderer, so they render in the same frame loop. Mosaics prewarm within 320px of the viewport; if one isn't ready 320ms after entering view, that image does a concurrent 460ms clean fade instead. When the dissolve ends the real photo sits underneath and the overlay fades out over 150ms. Exact-pinned img-fx/Three packages load locally only for eligible images. Semantic images and source text remain accessible beneath decorative overlays. Reduced motion, no JS, missing WebGL/observers, dependency failure, slow bootstrap and font failure show final plain content. Major-performance-caveat contexts and known software renderers (SwiftShader, llvmpipe, softpipe and Basic Render Driver) also show originals without loading the SDK: synchronous software-GPU compilation can block the page beyond any JavaScript safety timer. No video autoplays. Fonts are self-hosted Geist and Geist Mono.

## Cloudflare deployment

```sh
npm run build
npx wrangler pages deploy dist --project-name spejava --branch redesign
```

Use the Bot's saved Pages Edit token through the environment, never a committed token. The `redesign` branch deploys a review alias without changing the main Pages deployment or the custom domain. Preview pages receive `X-Robots-Tag: noindex,nofollow`; canonical URLs remain on spejava.com.

GitHub Actions validates PRs and can publish approved code merged into main if the repository has `CLOUDFLARE_API_TOKEN`. Without it deployment is intentionally manual. This secret affects code releases, not CMS publishing.

Before cutover: complete SPE's content/asset approvals, verify native editor login/publish/draft behavior with the actual project, approve and test any submission backend, run desktop/mobile and reduced-motion browser QA, then separately approve DNS changes. Framer stays live throughout review.
