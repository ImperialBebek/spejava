import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import { articles, events, legacyUrl, navigation, sponsors } from './content'
import { instagramPosts, readInstagramPosts } from './instagram'

test('all non-homepage links preserve existing SPE Java destinations', () => {
  for (const item of navigation) {
    assert.equal(new URL(legacyUrl(item.path)).origin, 'https://spejava.com')
  }
  const eventsMenu = navigation.find((item) => item.label === 'Events')
  assert.equal(eventsMenu?.children?.find((item) => item.label === 'Annual Energy Symposium')?.url, 'https://spejava.com/articles/aes')
  for (const article of articles) assert.match(article.slug, /^[a-z0-9-]+$/)
})

test('all content images exist locally and have meaningful descriptions', () => {
  for (const item of [...articles, ...events]) {
    assert.ok(existsSync(`public/images/${item.image}`), item.image)
    assert.ok(item.alt.length > 15)
  }
  for (const sponsor of sponsors) assert.ok(existsSync(`public/images/${sponsor.image}`))
  for (const post of instagramPosts) {
    assert.ok(existsSync(`public${post.mediaUrl}`))
    assert.ok(post.caption.length > 15)
  }
})

test('homepage renders crawlable headings and links without JavaScript', () => {
  const html = renderToStaticMarkup(<App />)
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  for (const heading of ['Latest Articles', 'Upcoming event', 'Join, Renew, Belong', 'Latest posts']) assert.ok(html.includes(heading))
  assert.ok(html.includes('https://www.spe.org/en/join/'))
  assert.ok(html.includes('https://spejava.com/contact'))
  assert.ok(html.includes('href="#main"'))
  assert.ok(html.includes('<details'))
  assert.ok(html.includes('loading="lazy"'), 'offscreen media should be lazy loaded')
  assert.ok(!html.includes('autoplay'), 'video should not autoplay')
  for (const post of instagramPosts) assert.ok(html.includes(post.permalink), 'Instagram posts must be available without JavaScript')
})

test('LinkedIn uses native iframe lazy loading without a nested visibility gate', () => {
  const html = renderToStaticMarkup(<App />)
  const iframe = html.match(/<iframe\b[^>]*>/)?.[0]
  assert.ok(iframe)
  assert.match(iframe, /loading="lazy"/)
  assert.ok(iframe.includes('https://static.elfsight.com/platform/platform.js'))
  assert.ok(iframe.includes('elfsight-app-3ce07fd6-0202-441b-8bc4-ed1382b6d543'))
  assert.ok(!iframe.includes('data-elfsight-app-lazy'), 'the inner visibility gate can stall when scrolled past the iframe origin')
})

test('Instagram feed accepts valid posts and rejects malformed or unsafe destinations', () => {
  const post = { ...instagramPosts[0], mediaUrl: 'https://images.feedspring.com/post.webp' }
  assert.deepEqual(readInstagramPosts({ data: { media: [post] } }), [post])
  assert.equal(readInstagramPosts({ data: { media: Array(5).fill(post) } }).length, 3)
  assert.deepEqual(readInstagramPosts(null), [])
  assert.deepEqual(readInstagramPosts({ error: 'Unavailable' }), [])
  assert.deepEqual(readInstagramPosts({ data: { media: [null, {}, { ...post, permalink: 'javascript:alert(1)' }, { ...post, mediaUrl: 'data:image/svg+xml,invalid' }] } }), [])
})
