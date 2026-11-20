import type { Content } from './model'
import { publicRoutes, type Route } from './routes'

export const siteOrigin = 'https://spejava.com'
export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ]!,
  )
export const jsonForHtml = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

export function metadata(route: Route) {
  const canonical =
    siteOrigin + (route.kind === 'not-found' ? '/404' : route.path)
  const title =
    route.path === '/'
      ? 'SPE Java Section | Society of Petroleum Engineers'
      : `${route.title} | SPE Java`
  const description = route.description.replace(/\s+/g, ' ').trim()
  const image = new URL(route.image || '/images/hero-1280.webp', siteOrigin)
    .href
  const organization = {
    '@type': 'Organization',
    name: 'SPE Java Section',
    url: siteOrigin,
    foundingDate: '1979-06-25',
  }
  const structured =
    route.kind === 'home'
      ? organization
      : route.post
        ? {
            '@type': 'Article',
            headline: route.title,
            description,
            image,
            inLanguage: route.language,
            ...(route.post.date ? { datePublished: route.post.date } : {}),
            ...(route.post.author
              ? { author: { '@type': 'Person', name: route.post.author } }
              : {}),
            publisher: organization,
            mainEntityOfPage: canonical,
          }
        : { '@type': 'WebPage', name: route.title, description, url: canonical }
  const meta = (key: string, value: string, property = false) =>
    `<meta ${property ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}" />`
  return `<title>${escapeHtml(title)}</title>
${meta('description', description)}
<link rel="canonical" href="${escapeHtml(canonical)}" />
${route.noindex ? meta('robots', 'noindex,nofollow') : ''}
${meta('og:type', route.post ? 'article' : 'website', true)}
${meta('og:title', title, true)}
${meta('og:description', description, true)}
${meta('og:url', canonical, true)}
${meta('og:site_name', 'SPE Java Section', true)}
${meta('og:locale', route.language === 'id' ? 'id_ID' : 'en_GB', true)}
${meta('og:image', image, true)}
${meta('og:image:alt', route.post?.alt || 'SPE Java Section community', true)}
${meta('twitter:card', 'summary_large_image')}
${meta('twitter:title', title)}
${meta('twitter:description', description)}
${meta('twitter:image', image)}
<script type="application/ld+json">${jsonForHtml({ '@context': 'https://schema.org', ...structured })}</script>`
}

export function renderDocument(
  template: string,
  route: Route,
  markup: string,
  content?: Content,
) {
  return template
    .replace('<html lang="en">', `<html lang="${route.language}">`)
    .replace('<!--head-meta-->', () => metadata(route))
    .replace('<!--app-html-->', () => markup)
    .replace('<!--content-data-->', () =>
      content
        ? `<script id="spe-content" type="application/json">${jsonForHtml(content)}</script>`
        : '',
    )
}

export function sitemap(content: Content) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicRoutes(
    content,
  )
    .filter((route) => !route.noindex)
    .map(
      (route) => `<url><loc>${escapeHtml(siteOrigin + route.path)}</loc></url>`,
    )
    .join('')}</urlset>`
}
