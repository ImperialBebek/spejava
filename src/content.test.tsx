import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import { articles, events, legacyUrl, navigation, sponsors } from './content'

test('all non-homepage links preserve existing SPE Java destinations', () => {
  for (const item of navigation) {
    assert.equal(new URL(legacyUrl(item.path)).origin, 'https://spejava.com')
  }
  for (const article of articles) assert.match(article.slug, /^[a-z0-9-]+$/)
})

test('all content images exist locally and have meaningful descriptions', () => {
  for (const item of [...articles, ...events]) {
    assert.ok(existsSync(`public/images/${item.image}`), item.image)
    assert.ok(item.alt.length > 15)
  }
  for (const sponsor of sponsors) assert.ok(existsSync(`public/images/${sponsor.image}`))
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
})
