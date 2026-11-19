# SPE Java homepage

A responsive rebuild of the current SPE Java homepage using React, TypeScript, Vite, and Tailwind CSS v4. The production build prerenders the complete homepage to HTML; no server or paid hosting runtime is needed.

## Development

Requires Node.js 20.19+ (Node 22 recommended).

```sh
npm ci
npm run dev
```

## Checks and production build

```sh
npm run check
npm test
npm run build
npm run preview
```

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Environment: `NODE_VERSION=22`
- No runtime environment variables or secrets are required.

For a direct upload after building: `npx wrangler pages deploy dist --project-name spejava`.

## Scope and migration safety

Only the homepage is rebuilt here. Article, event, student, about, and contact links explicitly retain their original `https://spejava.com` destinations. **Do not move the spejava.com domain to this homepage-only deployment:** other pages, registration forms, and the CMS still belong to the existing Framer site. The Cloudflare Pages URL is a review deployment, not a domain cutover.

Content is maintained in `src/content.ts`. Images and the Instrument Sans font are served locally, using assets from the current site. The existing membership video stays at the repository root and is copied into `dist` during the build. Video playback is user-controlled, and the existing Elfsight LinkedIn widget is lazy loaded below the main content.

A browser CMS, the remaining pages, content migration, and registration forms are not part of this homepage rebuild. No new dates or claims have been invented; featured articles and event dates match the current homepage.
