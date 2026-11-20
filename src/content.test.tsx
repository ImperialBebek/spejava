import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { renderToStaticMarkup as render } from 'react-dom/server'
import createApp from './App'
import { snapshot } from './data'
import { jsonForHtml, metadata, renderDocument, sitemap } from './document'
import { isEditionOpen, isPastEvent, type ProgramEdition } from './model'
import { publicRoutes, resolveRoute } from './routes'
import { Markdown } from './richtext'
import { validateContent, validatePost, validateProgram } from './validation'
import { portableBody } from '../scripts/export-sanity'

test('all 34 legacy addresses resolve within the 47-route site', () => {
  const legacy = JSON.parse(readFileSync('content/legacy-routes.json', 'utf8'))
  const paths: string[] = Array.isArray(legacy)
    ? legacy.map((value) => (typeof value === 'string' ? value : value.path))
    : legacy.routes
  assert.equal(paths.length, 34)
  for (const path of paths)
    assert.notEqual(resolveRoute(path).kind, 'not-found', path)
  assert.equal(publicRoutes(snapshot).length, 47)
  assert.equal(resolveRoute('/events/?filter=archive#all').kind, 'events')
  assert.equal(resolveRoute('/not-a-page').kind, 'not-found')
})

test('all routes render one h1, a skip link, local images with alt, and valid local links', async () => {
  for (const route of publicRoutes(snapshot)) {
    const html = render(await createApp({ path: route.path }))
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route.path)
    assert.ok(
      html.includes('id="main"') && html.includes('href="#main"'),
      route.path,
    )
    for (const match of html.matchAll(/href="(\/(?!\/)[^"]*)"/g)) {
      const path = new URL(
        match[1].replace(/&amp;/g, '&'),
        'https://spejava.com',
      ).pathname
      assert.ok(
        path === '/admin/' ||
          resolveRoute(path).kind !== 'not-found' ||
          existsSync(`public${path}`),
        `${route.path} links to ${path}`,
      )
    }
    for (const match of html.matchAll(/<img\b[^>]*>/g))
      assert.match(match[0], /\balt="[^"]*"/, `${route.path}: missing alt`)
    for (const match of html.matchAll(/src="(\/(?!\/)[^"]*)"/g))
      assert.ok(existsSync(`public${match[1]}`), `${route.path}: ${match[1]}`)
    assert.ok(
      !/javascript:|data-elfsight-app|framerusercontent\.com/.test(html),
      route.path,
    )
  }
})

test('event dates include the final day in Jakarta, independent of registration status', () => {
  const event = {
    start: '2030-06-26',
    venue: '',
    format: 'AES' as const,
    registrationStatus: 'closed' as const,
  }
  assert.equal(isPastEvent(event, new Date('2030-06-25T00:00:00Z')), false)
  assert.equal(isPastEvent(event, new Date('2030-06-26T16:59:59Z')), false)
  assert.equal(isPastEvent(event, new Date('2030-06-26T17:00:00Z')), true)
  assert.equal(isPastEvent({ ...event, start: '' }), false)
  assert.equal(
    isPastEvent({ ...event, end: '2030-06-28' }, new Date('2030-06-27')),
    false,
  )
})

test('programme applications need confirmed dates, URL, and an explicit open status', () => {
  const edition: ProgramEdition = {
    year: 2030,
    title: 'Scholarship 2030',
    opens: '2030-01-01',
    closes: '2030-01-31',
    status: 'open',
    registrationUrl: 'https://forms.gle/example',
    body: '',
    sponsors: [],
  }
  assert.equal(isEditionOpen(edition, new Date('2030-01-15')), true)
  assert.equal(isEditionOpen(edition, new Date('2030-01-31T16:59:59Z')), true)
  assert.equal(isEditionOpen(edition, new Date('2030-01-31T17:00:00Z')), false)
  assert.equal(
    isEditionOpen({ ...edition, status: 'tbc' }, new Date('2030-01-15')),
    false,
  )
  assert.throws(
    () =>
      validateProgram({
        ...snapshot.programs[0],
        editions: [{ ...edition, closes: '' }],
      }),
    /confirmed dates/,
  )
})

test('malformed CMS data and script URLs fail validation', () => {
  for (const image of ['javascript:alert(1)', '//evil.example/image.jpg'])
    assert.throws(() => validatePost({ ...snapshot.posts[0], image }), /URL/)
  assert.throws(
    () => validatePost({ ...snapshot.posts[0], date: '2025-02-31' }),
    /date/,
  )
  assert.throws(
    () =>
      validatePost({ ...snapshot.posts[0], image: '/media/a.webp', alt: '' }),
    /alternative text/,
  )
  assert.throws(
    () =>
      validatePost({
        ...snapshot.posts[0],
        bodyBlocks: [{ _type: 'script', value: '<script>' }],
      }),
    /block/,
  )
  assert.throws(
    () =>
      validateContent(
        { ...snapshot, posts: [snapshot.posts[0], snapshot.posts[0]] },
        'sanity',
      ),
    /Duplicate/,
  )
  const html = render(
    <Markdown>
      {'<script>alert(1)</script>\n\n[Bad](javascript:alert(1))'}
    </Markdown>,
  )
  assert.ok(!html.includes('<script>') && !html.includes('href="javascript:'))
  assert.ok(
    !jsonForHtml({ text: '</script><script>alert(1)</script>&' }).includes('<'),
  )
})

test('historical form links are visibly closed rather than active', () => {
  const html = render(
    <Markdown archive>{'[Register](https://forms.gle/old)'}</Markdown>,
  )
  assert.ok(!html.includes('href='))
  assert.ok(html.includes('historical registration; closed'))
})

test('metadata is route-specific, safe, and excludes editorial quarantine from search', () => {
  const template =
    '<html lang="en"><head><!--head-meta--></head><body><!--app-html--><!--content-data--></body></html>'
  for (const route of publicRoutes(snapshot)) {
    const html = renderDocument(
      template,
      route,
      '<main>Content</main>',
      snapshot,
    )
    assert.ok(html.includes(`https://spejava.com${route.path}`))
    assert.ok(html.includes(`lang="${route.language}"`))
    assert.ok(
      html.includes('application/ld+json') && html.includes('id="spe-content"'),
    )
    assert.ok(!html.includes('<!--'))
  }
  assert.ok(metadata(resolveRoute('/404')).includes('noindex,nofollow'))
  for (const post of snapshot.posts.filter((post) => post.reviewRequired))
    assert.ok(
      metadata(resolveRoute(`/articles/${post.slug}`)).includes(
        'noindex,nofollow',
      ),
    )
  assert.ok(!sitemap(snapshot).includes('consectetur'))
})

test('Markdown migration preserves headings, marks, links and lists in Portable Text', () => {
  const blocks = portableBody(
    '## Heading\n\nA **bold** word and a [source](https://spe.org).\n\n- One\n- Two',
  )
  assert.equal(blocks[0].style, 'h2')
  assert.ok(blocks.some((block) => block.listItem === 'bullet'))
  const html = render(<Markdown blocks={blocks}>{''}</Markdown>)
  assert.ok(
    html.includes('<strong>bold</strong>') &&
      html.includes('href="https://spe.org"') &&
      html.includes('<ul>'),
  )
})

test('the unconfigured contact form cannot transmit personal information', async () => {
  const html = render(await createApp({ path: '/contact' }))
  assert.match(html, /<button[^>]*disabled/)
  assert.ok(!html.includes('<form action='))
  assert.ok(html.includes('TBC'))
})

test('publishing a future event replaces the home empty state, but review drafts do not', async () => {
  const base = snapshot.posts.find((post) => post.event)!
  const year = new Date().getFullYear() + 2
  const event = {
    ...base,
    slug: 'synthetic-future-event',
    title: 'Synthetic future event',
    reviewRequired: false,
    event: {
      ...base.event!,
      start: `${year}-06-26`,
      end: '',
      registrationStatus: 'closed' as const,
    },
  }
  const html = render(
    await createApp({
      content: { ...snapshot, posts: [...snapshot.posts, event] },
    }),
  )
  assert.ok(html.includes('Synthetic future event'))
  assert.ok(!html.includes('No upcoming event is confirmed here yet.'))
  const reviewed = render(
    await createApp({
      content: {
        ...snapshot,
        posts: [...snapshot.posts, { ...event, reviewRequired: true }],
      },
    }),
  )
  assert.ok(!reviewed.includes('Synthetic future event'))
})

test('undated published events remain discoverable with an explicit TBC state', async () => {
  const base = snapshot.posts.find((post) => post.event)!
  const post = {
    ...base,
    slug: 'date-pending',
    title: 'Synthetic undated event',
    reviewRequired: false,
    event: {
      ...base.event!,
      start: '',
      end: '',
      registrationStatus: 'tbc' as const,
    },
  }
  const content = { ...snapshot, posts: [post] }
  const events = render(await createApp({ path: '/events', content }))
  assert.match(events, /Dates to be confirmed/)
  assert.match(events, /Synthetic undated event/)
  const home = render(await createApp({ content }))
  assert.ok(home.includes('Date TBC'))
  assert.ok(!home.includes('>PAST<'))
})

test('the legacy Height sample scholarship page stays quarantined', async () => {
  assert.equal(
    snapshot.posts.find((post) => post.slug === 'beasiswa-spe')?.reviewRequired,
    true,
  )
  assert.equal(resolveRoute('/articles/beasiswa-spe').noindex, true)
  assert.ok(!sitemap(snapshot).includes('/articles/beasiswa-spe'))
  assert.ok(
    !render(await createApp({ path: '/blog' })).includes('Beasiswa SPE Event'),
  )
})

test('programme social/search descriptions reflect confirmed open editions', () => {
  const opens = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10)
  const closes = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  for (const program of snapshot.programs) {
    const edition: ProgramEdition = {
      year: new Date().getFullYear(),
      title: 'Synthetic confirmed edition',
      opens,
      closes,
      registrationUrl: 'https://example.org/apply',
      status: 'open',
      body: '',
      sponsors: [],
    }
    const route = resolveRoute('/' + program.slug, {
      ...snapshot,
      programs: [{ ...program, editions: [edition] }],
    })
    assert.match(route.description, /Applications are open until/)
    const tags = metadata(route)
    assert.ok(tags.includes('Synthetic confirmed edition'))
    assert.ok(!tags.includes('No current application round'))
    assert.ok(
      !tags.includes('Future editions and registration await confirmation'),
    )
  }
})
