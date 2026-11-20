import { Markdown } from '../richtext'
import {
  Arrow,
  ButtonLink,
  LatestStories,
  PageHeading,
  PostImage,
  Stamp,
  Tbc,
} from '../components'
import { displayDate, isPastEvent, plainBody, type Post } from '../model'

function Byline({ post }: { post: Post }) {
  const minutes = Math.max(
    1,
    Math.ceil(plainBody(post).split(/\s+/).length / 220),
  )
  return (
    <div className="byline meta">
      {post.author && <span>By {post.author}</span>}
      <time dateTime={post.date || undefined}>{displayDate(post.date)}</time>
      <span>{minutes} min read · estimate</span>
      <span>
        {post.language.toUpperCase()} · {post.category}
      </span>
    </div>
  )
}

function ArchiveNotice({ review = false }: { review?: boolean }) {
  return (
    <aside
      className="notice"
      aria-label={review ? 'Editorial review notice' : 'Archive notice'}
    >
      {review ? (
        <>
          <Tbc>editorial review and publication approval</Tbc>
          <p>
            This legacy address is preserved, but this record is excluded from
            featured stories pending SPE Java’s review.
          </p>
        </>
      ) : (
        <>
          <Stamp>ARCHIVE · REGISTRATION CLOSED</Stamp>
          <p>
            This is a historical announcement. Dates, prices, deadlines and
            registration invitations below are retained for reference, not
            advertised as current.
          </p>
        </>
      )}
    </aside>
  )
}

export default function PostPage({ post }: { post: Post }) {
  const historical = post.archived === true
  if (post.event) return <EventDetail post={post} />
  return (
    <>
      <PageHeading
        title={post.title}
        rail={displayDate(post.date)}
        className="article-head"
      />
      <Byline post={post} />
      {post.reviewRequired && <ArchiveNotice review />}
      {historical && <ArchiveNotice />}
      {post.image && (
        <figure className="article-photo">
          <PostImage post={post} />
        </figure>
      )}
      <div className="article-layout grid">
        <article className="reading" lang={post.language}>
          <Markdown archive={historical} blocks={post.bodyBlocks}>
            {post.body}
          </Markdown>
          <div className="article-bottom">
            <a href="/blog" className="inline-link">
              All stories
              <Arrow />
            </a>
          </div>
        </article>
      </div>
      <LatestStories title="Keep exploring" exclude={post.slug} />
    </>
  )
}

function EventDetail({ post }: { post: Post }) {
  const event = post.event!
  const past = isPastEvent(event)
  const open =
    !past &&
    event.registrationStatus === 'open' &&
    !!event.registrationUrl &&
    !!event.start
  return (
    <>
      <section className="page-head event-heading grid">
        <div className="rail">
          <time dateTime={event.start || undefined}>
            {displayDate(event.start)}
          </time>
        </div>
        <div className="head-copy">
          <a href="/events" className="back">
            <Arrow />
            Back to events
          </a>
          <h1>{post.title}</h1>
          <p className="lead">{post.excerpt}</p>
          <Stamp>{past ? 'PAST' : open ? 'OPEN' : 'UPCOMING'}</Stamp>{' '}
          <span className="meta">{event.format}</span>
        </div>
        <aside className="event-summary">
          <h2>Event at a glance</h2>
          <dl className="facts">
            <div>
              <dt>DATE</dt>
              <dd>
                {displayDate(event.start)}
                {event.end && ` – ${displayDate(event.end)}`}
              </dd>
            </div>
            <div>
              <dt>TIME / TIMEZONE</dt>
              <dd>
                <Tbc>confirmed event time</Tbc>
              </dd>
            </div>
            <div>
              <dt>VENUE</dt>
              <dd>{event.venue || <Tbc>confirmed venue</Tbc>}</dd>
            </div>
            <div>
              <dt>REGISTRATION</dt>
              <dd>
                {past ? (
                  'Closed · past event'
                ) : open ? (
                  'Open on the external registration website'
                ) : (
                  <Tbc>approved registration details</Tbc>
                )}
              </dd>
            </div>
          </dl>
          {open && (
            <ButtonLink href={event.registrationUrl!}>
              Register with the organiser
            </ButtonLink>
          )}
          {past && event.registrationUrl && (
            <a
              className="inline-link"
              href={event.registrationUrl}
              rel="noopener noreferrer"
            >
              Original registration page · archive
              <Arrow />
            </a>
          )}
        </aside>
      </section>
      {past && <ArchiveNotice />}
      {post.image && (
        <div className="grid">
          <figure className="poster-large">
            <PostImage post={post} />
            <figcaption className="meta">
              Original event poster
              {past
                ? '. Registration information is retained as an archive.'
                : '.'}
            </figcaption>
          </figure>
          <aside className="poster-note">
            <h2>
              {past
                ? 'A record of shared knowledge.'
                : 'Plan your participation.'}
            </h2>
            <p>
              {past
                ? 'This event has passed. Follow section announcements for confirmed future programs.'
                : 'Check the organiser’s registration page for confirmed fees, requirements and availability.'}
            </p>
            <ButtonLink href="/events" secondary>
              Explore all events
            </ButtonLink>
          </aside>
        </div>
      )}
      <div className="article-layout grid">
        <article className="reading" lang={post.language}>
          <h2>Event overview</h2>
          <Markdown archive={past} blocks={post.bodyBlocks}>
            {post.body}
          </Markdown>
        </article>
      </div>
      <LatestStories title="From the section" exclude={post.slug} />
    </>
  )
}
