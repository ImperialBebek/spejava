import type { EventContext } from '@cloudflare/workers-types'
import { renderToString } from 'react-dom/server.browser'
import createApp from '../src/App'
import { snapshot } from '../src/data'
import { renderDocument, sitemap } from '../src/document'
import { resolveRoute } from '../src/routes'
import { loadContent } from '../src/server/sanity'

type Context = EventContext<Env, string, Record<string, unknown>>
export async function onRequest(context: Context) {
  const { request, env } = context
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    })
  const url = new URL(request.url)
  const preview =
    url.hostname.endsWith('.pages.dev') ||
    ['localhost', '127.0.0.1'].includes(url.hostname)
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cache-Control': 'public, max-age=0, s-maxage=60',
  })
  if (preview) headers.set('X-Robots-Tag', 'noindex,nofollow')
  try {
    const known = resolveRoute(url.pathname, snapshot).kind !== 'not-found'
    const dynamic =
      /^\/(?:articles|student-chapter)\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(
        url.pathname,
      )
    const unknown = !known && !dynamic && url.pathname !== '/sitemap.xml'
    const edgeCache =
      typeof caches === 'undefined'
        ? undefined
        : (caches as CacheStorage & { default?: Cache }).default
    const content = unknown
      ? {
          ...snapshot,
          source: env.SANITY_PROJECT_ID
            ? ('sanity' as const)
            : ('snapshot' as const),
        }
      : await loadContent(
          { projectId: env.SANITY_PROJECT_ID, dataset: env.SANITY_DATASET },
          fetch,
          edgeCache,
        )
    if (url.pathname === '/sitemap.xml') {
      headers.set('Content-Type', 'application/xml; charset=utf-8')
      return new Response(request.method === 'HEAD' ? null : sitemap(content), {
        headers,
      })
    }
    const route = resolveRoute(url.pathname, content)
    if (route.noindex) headers.set('X-Robots-Tag', 'noindex,nofollow')
    if (request.method === 'HEAD')
      return new Response(null, {
        status: route.kind === 'not-found' ? 404 : 200,
        headers,
      })
    const shell = await env.ASSETS.fetch(new URL('/_shell', url).href)
    if (!shell.ok || !shell.headers.get('content-type')?.includes('text/html'))
      throw new Error('Site shell unavailable')
    const template = await shell.text()
    if (template.length > 50_000 || !template.includes('<!--app-html-->'))
      throw new Error('Invalid site shell')
    const markup = renderToString(
      await createApp({ path: url.pathname, content }),
    )
    const document = renderDocument(
      template,
      route,
      markup,
      content.source === 'sanity' ? content : undefined,
    )
    return new Response(document, {
      status: route.kind === 'not-found' ? 404 : 200,
      headers,
    })
  } catch {
    console.error(
      JSON.stringify({ event: 'page_render_failed', path: url.pathname }),
    )
    headers.set('Cache-Control', 'no-store')
    headers.set('Retry-After', '60')
    headers.set('X-Robots-Tag', 'noindex,nofollow')
    return new Response(
      request.method === 'HEAD'
        ? null
        : '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Temporarily unavailable | SPE Java</title><main><h1>Temporarily unavailable</h1><p>Please try again shortly. Your message has not been submitted.</p></main></html>',
      { status: 503, headers },
    )
  }
}
