import {
  isSafeUrl,
  type BodyBlock,
  type Chapter,
  type Content,
  type Post,
  type Program,
  type ProgramEdition,
} from './model'

type RecordValue = Record<string, unknown>
const categories: Post['category'][] = [
  'Industry news',
  'Students',
  'Section news',
  'Technical perspectives',
]
const formats = [
  'Workshop',
  'Symposium',
  'Technical talk',
  'AES',
  'Young Professionals',
  'Partner event',
]
function record(value: unknown): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid content record')
  return value as RecordValue
}
function text(value: RecordValue, key: string, required = false) {
  const result = value[key] ?? ''
  if (
    typeof result !== 'string' ||
    (required && !result.trim()) ||
    result.length > 500_000
  )
    throw new Error(`Invalid content field: ${key}`)
  return result
}
function slug(value: RecordValue) {
  const result = text(value, 'slug', true)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result))
    throw new Error('Invalid content slug')
  return result
}
function url(value: RecordValue, key: string) {
  const result = text(value, key)
  if (
    result &&
    (!isSafeUrl(result) ||
      (key === 'registrationUrl' && result.startsWith('/')))
  )
    throw new Error(`Unsafe content URL: ${key}`)
  return result
}
function date(value: RecordValue, key: string) {
  const result = text(value, key)
  if (
    result &&
    (!/^\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-]\d\d:\d\d))?$/.test(result) ||
      !Number.isFinite(Date.parse(result)) ||
      new Date(`${result.slice(0, 10)}T12:00:00Z`)
        .toISOString()
        .slice(0, 10) !== result.slice(0, 10))
  )
    throw new Error(`Invalid content date: ${key}`)
  return result
}
function blocks(value: RecordValue): BodyBlock[] | undefined {
  if (value.bodyBlocks == null) return undefined
  if (!Array.isArray(value.bodyBlocks) || value.bodyBlocks.length > 10_000)
    throw new Error('Invalid body blocks')
  for (const block of value.bodyBlocks) {
    const item = record(block)
    if (item._type === 'image') {
      url(item, 'url')
      text(item, 'alt', true)
    } else if (item._type === 'block' && Array.isArray(item.children)) {
      if (item.children.some((child) => typeof record(child).text !== 'string'))
        throw new Error('Invalid block span')
    } else throw new Error('Unsupported body block')
  }
  return value.bodyBlocks as BodyBlock[]
}
export function validatePost(input: unknown): Post {
  const value = record(input)
  const kind = value.kind === 'event' ? 'event' : 'article'
  const image = url(value, 'image'),
    alt = text(value, 'alt')
  if (image && !alt.trim()) throw new Error('An image needs alternative text')
  const post: Post = {
    slug: slug(value),
    kind,
    title: text(value, 'title', true),
    excerpt: text(value, 'excerpt'),
    body: text(value, 'body'),
    bodyBlocks: blocks(value),
    image,
    alt,
    imageWidth:
      typeof value.imageWidth === 'number' ? value.imageWidth : undefined,
    imageHeight:
      typeof value.imageHeight === 'number' ? value.imageHeight : undefined,
    date: date(value, 'date'),
    author: text(value, 'author'),
    category: categories.includes(value.category as Post['category'])
      ? (value.category as Post['category'])
      : 'Section news',
    language: value.language === 'id' ? 'id' : 'en',
    sourceUrl: url(value, 'sourceUrl'),
    featured: value.featured === true,
    archived: value.archived === true,
    reviewRequired: value.reviewRequired === true,
  }
  if (!post.body.trim() && !post.bodyBlocks?.length)
    throw new Error('A post needs body content')
  if (kind === 'event') {
    const event = record(value.event)
    const status = text(event, 'registrationStatus')
    if (
      !['closed', 'tbc', 'open'].includes(status) ||
      !formats.includes(text(event, 'format'))
    )
      throw new Error('Invalid event settings')
    const start = date(event, 'start'),
      end = date(event, 'end'),
      registrationUrl = url(event, 'registrationUrl')
    if (start && end && end < start)
      throw new Error('Event end precedes its start')
    if (status === 'open' && (!start || !registrationUrl))
      throw new Error('Open registration needs a confirmed date and URL')
    post.event = {
      start,
      end,
      venue: text(event, 'venue'),
      format: event.format as NonNullable<Post['event']>['format'],
      registrationUrl,
      registrationStatus: status as NonNullable<
        Post['event']
      >['registrationStatus'],
    }
  }
  return post
}
export function validateChapter(input: unknown): Chapter {
  const value = record(input),
    email = text(value, 'email')
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error('Invalid chapter email')
  return {
    slug: slug(value),
    name: text(value, 'name', true),
    city: text(value, 'city'),
    image: url(value, 'image'),
    description: text(value, 'description'),
    website: url(value, 'website'),
    email,
    body: text(value, 'body'),
    bodyBlocks: blocks(value),
  }
}
export function validateProgram(input: unknown): Program {
  const value = record(input),
    name = slug(value)
  if (name !== 'aes' && name !== 'scholarship')
    throw new Error('Unknown programme address')
  const editions: ProgramEdition[] =
    value.editions == null
      ? []
      : (Array.isArray(value.editions)
          ? value.editions
          : (() => {
              throw new Error('Invalid programme editions')
            })()
        ).map((item) => {
          const edition = record(item)
          const opens = date(edition, 'opens'),
            closes = date(edition, 'closes'),
            registrationUrl = url(edition, 'registrationUrl')
          if (opens && closes && closes < opens)
            throw new Error('Edition closes before it opens')
          if (!['open', 'closed', 'tbc'].includes(text(edition, 'status')))
            throw new Error('Invalid edition status')
          if (
            edition.status === 'open' &&
            (!opens || !closes || !registrationUrl)
          )
            throw new Error(
              'An open edition needs confirmed dates and registration URL',
            )
          if (
            typeof edition.year !== 'number' ||
            !Number.isInteger(edition.year) ||
            edition.year < 1979 ||
            edition.year > 2100
          )
            throw new Error('Invalid edition year')
          return {
            year: edition.year,
            title: text(edition, 'title', true),
            opens,
            closes,
            registrationUrl,
            status: edition.status as ProgramEdition['status'],
            body: text(edition, 'body'),
            bodyBlocks: blocks(edition),
            sponsors: (Array.isArray(edition.sponsors)
              ? edition.sponsors
              : []
            ).map((item) => {
              const sponsor = record(item),
                image = url(sponsor, 'image'),
                alt = text(sponsor, 'alt')
              if (image && !alt)
                throw new Error('A sponsor logo needs alternative text')
              return {
                name: text(sponsor, 'name', true),
                website: url(sponsor, 'website'),
                image,
                alt,
                approved: sponsor.approved === true,
              }
            }),
          }
        })
  return {
    slug: name,
    title: text(value, 'title', true),
    body: text(value, 'body'),
    bodyBlocks: blocks(value),
    year: typeof value.year === 'number' ? value.year : null,
    registrationUrl: url(value, 'registrationUrl'),
    registrationStatus:
      value.registrationStatus === 'closed' ? 'closed' : 'tbc',
    editions,
  }
}
export function validateContent(
  input: unknown,
  source: Content['source'],
): Content {
  const value = record(input)
  const collection = <T extends { slug: string }>(
    key: string,
    validate: (item: unknown) => T,
  ) => {
    if (!Array.isArray(value[key]) || value[key].length > 5_000)
      throw new Error(`Invalid collection: ${key}`)
    const results = value[key].map(validate)
    if (new Set(results.map((item) => item.slug)).size !== results.length)
      throw new Error(`Duplicate slugs: ${key}`)
    return results
  }
  return {
    posts: collection('posts', validatePost),
    chapters: collection('chapters', validateChapter),
    programs: collection('programs', validateProgram),
    source,
  }
}
