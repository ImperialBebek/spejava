import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { renderToString } from 'react-dom/server'
import createApp from '../src/App'
import { snapshot } from '../src/data'
import { renderDocument, sitemap } from '../src/document'
import { publicRoutes, resolveRoute } from '../src/routes'

const template = await readFile('dist/index.html', 'utf8')
await writeFile('dist/_shell.html', template)
const routes = publicRoutes(snapshot)
for (const route of routes) {
  const folder = route.path === '/' ? 'dist' : `dist${route.path}`
  await mkdir(folder, { recursive: true })
  await writeFile(
    `${folder}/index.html`,
    renderDocument(template, route, renderToString(await createApp({ path: route.path }))),
  )
}
const notFound = resolveRoute('/404')
await writeFile(
  'dist/404.html',
  renderDocument(template, notFound, renderToString(await createApp({ path: '/404' }))),
)
await writeFile('dist/sitemap.xml', sitemap(snapshot))
await copyFile('spe-join-member.mp4', 'dist/spe-join-member.mp4')
console.log(
  `Prerendered ${routes.length} routes, a 404 page and the CMS runtime shell.`,
)
