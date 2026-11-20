import type { EventContext } from '@cloudflare/workers-types'

export async function onRequest({
  request,
  env,
}: EventContext<Env, string, Record<string, unknown>>) {
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    })
  const response = await env.ASSETS.fetch(new URL('/admin/', request.url).href)
  const headers = new Headers(response.headers)
  headers.set('X-Robots-Tag', 'noindex,nofollow')
  headers.set('Cache-Control', 'no-store')
  const html = request.method === 'HEAD' ? null : await response.text()
  if (html && html.length > 100_000)
    return new Response('Editor shell is unavailable', { status: 503 })
  return new Response(html, { status: response.status, headers })
}
