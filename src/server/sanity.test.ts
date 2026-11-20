import test from 'node:test'
import assert from 'node:assert/strict'
import { snapshot } from '../data'
import { contentUrl, loadContent } from './sanity'

const settings = { projectId: 'spejava123', dataset: 'production' }
test('unconfigured CMS is labelled snapshot and makes no requests', async () => {
  assert.equal((await loadContent({}, async () => { throw new Error('Must not fetch') })).source, 'snapshot')
})
test('published queries stay on the configured Sanity CDN with no auth token', async () => {
  const url = contentUrl(settings)!
  assert.equal(url.hostname, 'spejava123.apicdn.sanity.io')
  assert.equal(url.searchParams.get('perspective'), 'published')
  assert.match(url.searchParams.get('query')!, /drafts\.\*\*/)
  assert.match(url.searchParams.get('query')!, /versions\.\*\*/)
  assert.throws(() => contentUrl({ ...settings, projectId: 'evil.example/path' }))
  assert.throws(() => contentUrl({ ...settings, dataset: '../private' }))
  const content = await loadContent(settings, async (_, options) => {
    assert.ok(!new Headers(options?.headers).has('Authorization'))
    return Response.json({ result: snapshot })
  })
  assert.equal(content.source, 'sanity')
  assert.equal(content.posts.length, 26)
})
test('configured outages, invalid records and oversized bodies fail closed', async () => {
  await assert.rejects(loadContent(settings, async () => new Response('', { status: 401 })), /retrieved/)
  await assert.rejects(loadContent(settings, async () => Response.json({ result: { posts: [] } })))
  await assert.rejects(loadContent(settings, async () => new Response(' ', { headers: { 'Content-Length': '3000001' } })), /size/)
  await assert.rejects(loadContent(settings, async () => new Response('x'.repeat(3_000_001))), /size/)
})
test('validated published content is cached for at most one minute', async () => {
  let saved: Response | undefined, requests = 0
  const cache: Pick<Cache, 'match' | 'put'> = { match: async () => saved?.clone(), put: async (_, value) => { saved = value } }
  const fetcher: typeof fetch = async () => { requests++; return Response.json({ result: snapshot }) }
  await loadContent(settings, fetcher, cache)
  assert.equal(saved?.headers.get('Cache-Control'), 'public, max-age=60')
  await loadContent(settings, fetcher, cache)
  assert.equal(requests, 1)
})
