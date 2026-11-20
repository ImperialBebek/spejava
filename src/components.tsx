import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useContent } from './data'
import { displayDate, isPastEvent, postPath, type Post } from './model'

export function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function ButtonLink({
  href,
  children,
  secondary = false,
}: {
  href: string
  children: ReactNode
  secondary?: boolean
}) {
  return (
    <a href={href} className={`button${secondary ? ' secondary' : ''}`}>
      {children}
      <Arrow />
    </a>
  )
}

export function Tbc({ children }: { children: ReactNode }) {
  return <span className="stamp tbc">[TBC: {children}]</span>
}

export function Stamp({ children }: { children: ReactNode }) {
  return <span className="stamp">{children}</span>
}

export function PageHeading({
  title,
  lead,
  rail = '2026',
  className = '',
}: {
  title: string
  lead?: string
  rail?: ReactNode
  className?: string
}) {
  return (
    <section className={`page-head grid ${className}`}>
      <div className="rail">{rail}</div>
      <div className="head-copy">
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </section>
  )
}

export function useSortedPosts() {
  return [...useContent().posts].sort(
    (a, b) =>
      (b.event?.start || b.date).localeCompare(a.event?.start || a.date) ||
      a.title.localeCompare(b.title),
  )
}

export function Header({ section }: { section: string }) {
  const [expanded, setExpanded] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const navigation = [
    ['/', 'Home'],
    ['/about', 'About'],
    ['/events', 'Events'],
    ['/blog', 'Stories'],
    ['/student-chapter', 'Students'],
    ['/membership', 'Membership'],
    ['/contact', 'Contact'],
  ]
  useEffect(() => {
    if (!expanded) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpanded(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [expanded])
  const links = navigation.map(([href, label]) => (
    <a
      key={href}
      href={href}
      aria-current={section === href ? 'page' : undefined}
    >
      {label}
    </a>
  ))
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href="/" aria-label="SPE Java Section home">
            <img src="/images/spe-logo.svg" width="74" height="40" alt="" />
            <span>
              Java
              <br />
              Section
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links}
          </nav>
          <a className="button header-join" href="https://www.spe.org/en/join/">
            Join SPE
            <Arrow />
          </a>
          <button
            ref={toggle}
            type="button"
            className="mobile-menu"
            aria-label={expanded ? 'Close menu' : 'Open menu'}
            aria-expanded={expanded}
            aria-controls="mobile-navigation"
            onClick={() => setExpanded((value) => !value)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                d={
                  expanded ? 'M6 6l12 12M6 18L18 6' : 'M4 7h16M4 12h16M4 17h16'
                }
              />
            </svg>
          </button>
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            hidden={!expanded}
          >
            {links}
          </nav>
        </div>
      </header>
    </>
  )
}

export function PostImage({
  post,
  className = '',
}: {
  post: Post
  className?: string
}) {
  return post.image ? (
    <img
      className={className}
      src={post.image}
      alt={post.alt}
      loading="lazy"
      decoding="async"
      width={post.imageWidth || undefined}
      height={post.imageHeight || undefined}
    />
  ) : null
}

export function StoryCard({ post }: { post: Post }) {
  return (
    <article className="story">
      <a href={postPath(post)} tabIndex={-1} aria-hidden="true">
        {post.image && (
          <img
            src={post.image}
            alt=""
            loading="lazy"
            decoding="async"
            width="600"
            height="364"
          />
        )}
      </a>
      <div className="meta">
        <span>{post.language.toUpperCase()}</span>
        <span>{post.category}</span>
        <time dateTime={post.date || undefined}>{displayDate(post.date)}</time>
      </div>
      <h3>
        <a href={postPath(post)}>{post.title}</a>
      </h3>
      <p>{post.excerpt}</p>
    </article>
  )
}

export function LatestStories({
  title = 'Latest stories',
  exclude,
}: {
  title?: string
  exclude?: string
}) {
  const stories = useSortedPosts()
    .filter(
      (post) =>
        post.kind === 'article' &&
        !post.reviewRequired &&
        post.slug !== exclude,
    )
    .slice(0, 3)
  return (
    <section className="section">
      <div className="section-title">
        <h2>{title}</h2>
        <a href="/blog">
          All stories
          <Arrow />
        </a>
      </div>
      <div className="grid">
        {stories.map((post) => (
          <StoryCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}

export function LatestEvent() {
  const posts = useSortedPosts()
  const events = posts.filter(
    (post) => post.kind === 'event' && post.event && !post.reviewRequired,
  )
  const next = events
    .filter((post) => post.event?.start && !isPastEvent(post.event))
    .sort((a, b) => a.event!.start.localeCompare(b.event!.start))[0]
  const latest =
    next ||
    events
      .filter((post) => isPastEvent(post.event!))
      .sort((a, b) => b.event!.start.localeCompare(a.event!.start))[0] ||
    events[0]
  const undated = latest && !latest.event?.start
  const award = posts.find(
    (post) =>
      post.slug === 'spe-java-section-named-regional-outstanding-section-2025',
  )
  return (
    <section
      className="home-latest section"
      aria-label="Latest from the section"
    >
      <aside className="surface">
        <h2>Latest from the section</h2>
        {latest && (
          <div className="latest-event">
            <p className="meta">
              {next ? 'Next event' : undated ? 'Date TBC' : 'Most recent event'}{' '}
              / <Stamp>{next ? 'UPCOMING' : undated ? 'TBC' : 'PAST'}</Stamp>
            </p>
            <h3>{latest.title}</h3>
            <p className="mono">{displayDate(latest.event?.start || '')}</p>
            <p>{latest.event?.venue || 'Venue TBC'}</p>
            <a className="rule-link" href={postPath(latest)}>
              {next || undated ? 'Explore the event' : 'Explore the past event'}
              <Arrow />
            </a>
          </div>
        )}
        {award && (
          <a className="recognition-link" href={postPath(award)}>
            <span>Regional Outstanding Section 2025</span>
            <Arrow />
          </a>
        )}
      </aside>
    </section>
  )
}

export function Filters({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="toolbar">
      <legend>{legend}</legend>
      {options.map((option) => (
        <button
          className="chip"
          type="button"
          key={option}
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </fieldset>
  )
}
