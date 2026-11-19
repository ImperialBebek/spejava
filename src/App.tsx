import { useEffect, useRef, useState } from 'react'
import { articles, events, legacyUrl, navigation, sponsors } from './content'
import { instagramFeedUrl, instagramPosts, readInstagramPosts } from './instagram'

function Chevron() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 9 7 7 7-7" /></svg>
}

function Header() {
  const links = navigation.map(({ label, path, children }) => (
    <div className="nav-item" key={path}>
      <a href={legacyUrl(path)}>{label}</a>
      {children && <details className="nav-dropdown">
        <summary aria-label={`More ${label.toLowerCase()} links`}><Chevron /></summary>
        <div className="nav-submenu">{children.map((child) => <a key={child.url} href={child.url}>{child.label}</a>)}</div>
      </details>}
    </div>
  ))

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="SPE Java Section home">
        <img src="/images/spe-logo.svg" alt="Society of Petroleum Engineers" width="74" height="40" />
        <span>Java Section</span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">{links}</nav>
      <details className="mobile-menu">
        <summary aria-label="Toggle navigation"><span /><span /><span /></summary>
        <nav aria-label="Mobile navigation">{links}</nav>
      </details>
    </header>
  )
}

function Partners() {
  return (
    <div className="partners" aria-label="Our industry partners">
      {[sponsors, [...sponsors].reverse()].map((column, index) => (
        <div className={`partner-column partner-column-${index}`} key={index}>
          <div className="partner-track">
            {[0, 1].map((copy) => <div className="partner-set" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {column.map((sponsor) => <div className="partner" key={sponsor.name}>
                <img src={`/images/${sponsor.image}`} alt={copy === 0 ? sponsor.name : ''} loading="lazy" width="150" height="60" />
              </div>)}
            </div>)}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventIcon({ location = false }: { location?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {location ? <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></> : <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 2v6m8-6v6M4 11h16" /></>}
  </svg>
}

function InstagramFeed() {
  const [posts, setPosts] = useState(instagramPosts)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function refresh() {
      try {
        const response = await fetch(instagramFeedUrl, { signal: controller.signal })
        if (!response.ok) return
        const posts = readInstagramPosts(await response.json())
        if (posts.length && !controller.signal.aborted) setPosts(posts)
      } catch {
        // Keep the local posts available when the feed cannot be reached.
      }
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      void refresh()
    }, { rootMargin: '200px' })
    if (container.current) observer.observe(container.current)
    return () => { observer.disconnect(); controller.abort() }
  }, [])

  return <div className="instagram-grid" ref={container} aria-label="Latest SPE Java Instagram posts">
    {posts.map((post) => <a className="instagram-card" href={post.permalink} target="_blank" rel="noreferrer" key={post.id}>
      <img src={post.mediaUrl} alt={post.caption.split('\n')[0]} width="640" height="640" loading="lazy" />
      <span className="instagram-overlay">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>
        <span>{post.likeCount} likes<span className="sr-only"> — view on Instagram (opens in a new tab)</span></span>
      </span>
    </a>)}
  </div>
}

function LatestPosts() {
  return <section className="latest-posts section-shell" aria-labelledby="posts-title">
    <h2 id="posts-title">Latest posts</h2>
    <InstagramFeed />
    <iframe
      className="social-feed"
      title="Latest SPE Java LinkedIn posts"
      loading="lazy"
          srcDoc={'<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;font-family:sans-serif}</style></head><body><script src="https://static.elfsight.com/platform/platform.js" async></script><div class="elfsight-app-3ce07fd6-0202-441b-8bc4-ed1382b6d543"></div></body></html>'}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin"
    />
    <a className="social-link" href="https://www.linkedin.com/company/spe-java-section" target="_blank" rel="noreferrer">Follow SPE Java on LinkedIn ↗</a>
  </section>
}

export default function App() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main">
      <a className="hero" href="https://convex.ipa.or.id/" target="_blank" rel="noreferrer" aria-label="50th IPA Convention and Exhibition — visit the event website (opens in a new tab)">
        <img src="/images/hero-1920.webp" srcSet="/images/hero-640.webp 640w, /images/hero-1280.webp 1280w, /images/hero-1920.webp 1920w" sizes="100vw" alt="50th IPA Convention and Exhibition: 50 years of energy partnership. 20–22 May 2026, ICE BSD City. Register at convex.ipa.or.id." width="1920" height="1034" fetchPriority="high" />
      </a>

      <section className="introduction section-shell" aria-labelledby="intro-title">
        <div className="introduction-copy">
          <h1 id="intro-title">Empowering the<br className="desktop-break" /> Future of Energy</h1>
          <p>SPE Java Indonesia is a dynamic and thriving section of the Society of Petroleum Engineers (SPE), the world's largest professional organization serving the upstream oil and gas industry. Founded in 1979, we have been at the forefront of technological advancements and professional development in Indonesia for over four decades.</p>
        </div>
        <Partners />
      </section>

      <section className="articles-section" aria-labelledby="articles-title">
        <div className="section-shell">
          <h2 id="articles-title">Latest Articles</h2>
          <div className="article-grid">
            {articles.map((article) => <article className="article-card" key={article.slug}>
              <a href={legacyUrl(`/articles/${article.slug}`)}>
                <img src={`/images/${article.image}`} alt={article.alt} width="640" height="480" loading="lazy" />
                <div className="article-title"><h3>{article.title}</h3></div>
              </a>
            </article>)}
          </div>
        </div>
      </section>

      <section className="events-section" aria-labelledby="events-title">
        <div className="section-shell">
          <h2 id="events-title">Upcoming event</h2>
          <p className="section-description">Check out the latest event happening around you</p>
          <div className="event-grid">
            {events.map((event) => <article className="event-card" key={event.title}>
              <a href={legacyUrl(event.path)}>
                <img className="event-image" src={`/images/${event.image}`} alt={event.alt} width="640" height="394" loading="lazy" />
                <h3>{event.title}</h3>
              </a>
              <p className="event-detail"><EventIcon /><time dateTime={event.dateTime}>{event.date}<span className="date-dot">·</span>{event.time}</time></p>
              {event.location && <p className="event-detail"><EventIcon location /><span>{event.location}</span></p>}
            </article>)}
          </div>
        </div>
      </section>

      <section className="membership" aria-labelledby="membership-title">
        <div className="membership-media">
          <video poster="/images/membership.webp" preload="none" controls playsInline loop muted aria-label="Discover the SPE community and membership">
            <source src="/spe-join-member.mp4" type="video/mp4" />
            Your browser does not support embedded video.
          </video>
        </div>
        <div className="membership-copy section-shell">
          <p className="eyebrow">Become SPE Member</p>
          <h2 id="membership-title">Join, Renew, Belong</h2>
          <p className="membership-description">SPE is a place for all of today's industry professionals, regardless of experience or course of study. Although engineers are the core of SPE's membership, scientists, managers, and other professionals in the industry are also a part of our SPE community.</p>
          <div className="membership-actions">
            <a className="button button-primary" href="https://www.spe.org/en/join/">Join now</a>
            <a className="button button-secondary" href={legacyUrl('/contact')}>Contact us</a>
          </div>
        </div>
      </section>
      <LatestPosts />
    </main>
  </>
}
