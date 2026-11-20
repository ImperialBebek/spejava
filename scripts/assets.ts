import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { renderEarthHTML } from '../src/earth.js'

const earth = JSON.parse(await readFile('public/media/earth.json', 'utf8'))
await writeFile(
  'src/generated-earth.ts',
  `export const staticEarth = ${JSON.stringify(renderEarthHTML(115, earth))}\n`,
)

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
