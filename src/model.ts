import type { PortableTextBlock } from '@portabletext/types'

export interface RichTextImage {
  _type: 'image'
  _key: string
  url: string
  alt: string
}
export type BodyBlock = PortableTextBlock | RichTextImage
export interface EventDetails {
  start: string
  end?: string
  venue: string
  format:
    | 'Workshop'
    | 'Symposium'
    | 'Technical talk'
    | 'AES'
    | 'Young Professionals'
    | 'Partner event'
  registrationUrl?: string
  registrationStatus: 'closed' | 'tbc' | 'open'
}
export interface Post {
  slug: string
  kind: 'article' | 'event'
  title: string
  excerpt: string
  body: string
  bodyBlocks?: BodyBlock[]
  image: string
  imageWidth?: number
  imageHeight?: number
  alt: string
  date: string
  author: string
  category:
    | 'Industry news'
    | 'Students'
    | 'Section news'
    | 'Technical perspectives'
  language: 'en' | 'id'
  sourceUrl: string
  featured: boolean
  archived?: boolean
  reviewRequired: boolean
  event?: EventDetails
}
export interface Chapter {
  slug: string
  name: string
  city: string
  image: string
  description: string
  website: string
  email: string
  body: string
  bodyBlocks?: BodyBlock[]
}
export interface Program {
  slug: 'aes' | 'scholarship'
  title: string
  body: string
  bodyBlocks?: BodyBlock[]
  year: number | null
  registrationUrl: string
  registrationStatus: 'closed' | 'tbc'
  editions?: ProgramEdition[]
}

export interface ProgramEdition {
  year: number
  title: string
  opens: string
  closes: string
  registrationUrl: string
  status: 'open' | 'closed' | 'tbc'
  body: string
  bodyBlocks?: BodyBlock[]
  sponsors: { name: string; website: string; image: string; alt: string; approved: boolean }[]
}

export function isEditionOpen(edition: ProgramEdition, now = new Date()) {
  const start = Date.parse(`${edition.opens}T00:00:00+07:00`)
  const end = Date.parse(`${edition.closes}T23:59:59+07:00`)
  return edition.status === 'open' && !edition.registrationUrl.startsWith('/') && isSafeUrl(edition.registrationUrl) && start <= +now && end >= +now
}
export interface Content {
  posts: Post[]
  chapters: Chapter[]
  programs: Program[]
  source: 'snapshot' | 'sanity'
}
export const postPath = (post: Pick<Post, 'slug'>) => `/articles/${post.slug}`
export function isPastEvent(event: EventDetails, now = new Date()) {
  const value = event.end || event.start
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59+07:00` : value,
  )
  return Number.isFinite(date.getTime()) && date < now
}
export function displayDate(value: string) {
  if (!value) return 'Date TBC'
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      }).format(date)
    : 'Date TBC'
}
export function isSafeUrl(value: string) {
  if (/[\u0000-\u0020\\]/.test(value)) return false
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}
export function plainBody(value: { body: string; bodyBlocks?: BodyBlock[] }) {
  return (
    value.bodyBlocks
      ?.map((block) =>
        'children' in block
          ? block.children.map((child) => child.text).join('')
          : '',
      )
      .join('\n\n') || value.body
  )
}
