import { copyFile, writeFile } from 'node:fs/promises'

await Promise.all([
  copyFile(
    'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
    'public/fonts/geist.woff2',
  ),
  copyFile(
    'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
    'public/fonts/geist-mono.woff2',
  ),
  copyFile(
    'node_modules/@fontsource-variable/geist/LICENSE',
    'public/fonts/OFL.txt',
  ),
])
await writeFile(
  'public/admin/config.json',
  JSON.stringify({ studioUrl: process.env.SANITY_STUDIO_URL || null }),
)
console.log(
  'Assets: Geist and Geist Mono; Sanity Studio link configured:',
  !!process.env.SANITY_STUDIO_URL,
)
