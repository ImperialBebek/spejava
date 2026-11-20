import { snapshot } from '../data'
import type { Content } from '../model'
import { validateContent } from '../validation'

export const sanityApiVersion = '2025-02-19'
const published = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))'
export const contentQuery = `{
  "posts": *[_type == "post" && ${published}]{
    "slug": slug.current, kind, title, excerpt, "body": coalesce(legacyBody, ""),
    "bodyBlocks": body[]{..., _type == "image" => {"url": asset->url}},
    "image": coalesce(image.asset->url, legacyImage), "alt": coalesce(image.alt, legacyAlt),
    "imageWidth": coalesce(image.asset->metadata.dimensions.width, legacyWidth), "imageHeight": coalesce(image.asset->metadata.dimensions.height, legacyHeight),
    date, author, category, language, sourceUrl, featured, archived, reviewRequired, event
  },
  "chapters": *[_type == "chapter" && ${published}]{
    "slug": slug.current, name, city, description, website, email, "image": coalesce(image.asset->url, legacyImage),
    "body": coalesce(legacyBody, ""), "bodyBlocks": body[]{..., _type == "image" => {"url": asset->url}}
  },
  "programs": *[_type == "program" && ${published}]{
    "slug": slug.current, title, year, registrationUrl, registrationStatus,
    "editions": editions[]{..., "body": "", "bodyBlocks": body[]{..., _type == "image" => {"url": asset->url}}, "sponsors": sponsors[]{..., "image": image.asset->url, "alt": image.alt}},
    "body": coalesce(legacyBody, ""), "bodyBlocks": body[]{..., _type == "image" => {"url": asset->url}}
  }
}`

export interface SanitySettings {
  projectId?: string
  dataset?: string
}
export function contentUrl({ projectId, dataset }: SanitySettings) {
  if (!projectId) return null
  if (
    !/^[a-z0-9]{3,32}$/.test(projectId) ||
    !dataset ||
    !/^[a-z0-9_-]{1,64}$/.test(dataset)
  )
    throw new Error('Invalid Sanity configuration')
  const url = new URL(
    `https://${projectId}.apicdn.sanity.io/v${sanityApiVersion}/data/query/${dataset}`,
  )
  url.search = new URLSearchParams({
    query: contentQuery,
    perspective: 'published',
  }).toString()
  return url
}

async function boundedJson(response: Response, maximum = 3_000_000) {
  if (
    Number(response.headers.get('content-length')) > maximum ||
    !response.body
  )
    throw new Error('Invalid CMS response size')
  const reader = response.body.getReader(),
    chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > maximum) {
        await reader.cancel()
        throw new Error('CMS response exceeds size limit')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as { result?: unknown }
}

export async function loadContent(
  settings: SanitySettings,
  fetcher: typeof fetch = fetch,
  cache?: Pick<Cache, 'match' | 'put'>,
): Promise<Content> {
  const url = contentUrl(settings)
  if (!url) return snapshot
  const key = new Request(url)
  try {
    const cached = cache && (await cache.match(key))
    if (cached) return validateContent(await cached.json(), 'sanity')
  } catch {
    /* A failed optional cache must not prevent a fresh validated read. */
  }
  const response = await fetcher(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error('CMS content could not be retrieved')
  const payload = await boundedJson(response)
  const content = validateContent(payload.result, 'sanity')
  if (cache)
    try {
      await cache.put(
        key,
        new Response(JSON.stringify(content), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60',
          },
        }),
      )
    } catch {
      /* Publishing remains available when the optional cache is full. */
    }
  return content
}
