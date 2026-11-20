import { useState } from 'react'
import {
  Arrow,
  Filters,
  PageHeading,
  Stamp,
  Tbc,
  useSortedPosts,
} from '../components'
import { displayDate, isPastEvent, postPath, type Post } from '../model'

export function EventTray({ post }: { post: Post }) {
  const event = post.event!
  const past = isPastEvent(event)
  return (
    <article className="tray grid">
      <div className="date-rail">
        <time dateTime={event.start || undefined}>
          {displayDate(event.start)}
        </time>
        <span className="meta">
          {!event.start ? 'TBC' : past ? 'ARCHIVE' : 'UPCOMING'}
        </span>
      </div>
      <a
        href={postPath(post)}
        className="event-poster"
        tabIndex={-1}
        aria-hidden="true"
      >
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
      <div className="event-copy">
        <Stamp>
          {!event.start
            ? 'TBC'
            : past
              ? 'PAST'
              : event.registrationStatus === 'open'
                ? 'OPEN'
                : 'UPCOMING'}
        </Stamp>{' '}
        <span className={`meta${event.format === 'AES' ? ' aes-type' : ''}`}>
          {event.format}
        </span>
        <h3>
          <a href={postPath(post)}>{post.title}</a>
        </h3>
        <p className="venue">{event.venue || <Tbc>venue</Tbc>}</p>
        <span className="meta">
          {past
            ? 'Archived event · registration closed'
            : 'See event details for confirmed registration information'}
        </span>
      </div>
      <a
        href={postPath(post)}
        className="event-go"
        aria-label={`View ${post.title}`}
      >
        <Arrow />
      </a>
    </article>
  )
}

export default function EventsPage() {
  const [format, setFormat] = useState('All')
  const events = useSortedPosts().filter(
    (post) => post.kind === 'event' && post.event && !post.reviewRequired,
  )
  const matches = events.filter(
    (post) => format === 'All' || post.event?.format === format,
  )
  const upcoming = matches.filter(
    (post) => post.event && !!post.event.start && !isPastEvent(post.event),
  )
  const undated = matches.filter((post) => !post.event?.start)
  const archive = matches.filter(
    (post) => post.event && isPastEvent(post.event),
  )
  const years = [
    ...new Set(archive.map((post) => post.event!.start.slice(0, 4))),
  ]
    .sort()
    .reverse()
  return (
    <>
      <PageHeading
        title="Knowledge, shared in person."
        lead="Technical talks, workshops and symposiums. Explore what’s confirmed and revisit the section’s event archive."
      />
      <Filters
        legend="Event type"
        options={['All', ...new Set(events.map((post) => post.event!.format))]}
        value={format}
        onChange={setFormat}
      />
      <p className="meta search-state" role="status">
        {matches.length} events match{' '}
        {format === 'All' ? 'all event types' : format}
      </p>
      <section className="section">
        <div className="section-title">
          <h2>At the surface</h2>
        </div>
        {upcoming.length ? (
          upcoming.map((post) => <EventTray key={post.slug} post={post} />)
        ) : (
          <div className="empty">
            <div>
              <Tbc>next confirmed event</Tbc>
              <p>No upcoming event is confirmed here yet.</p>
            </div>
            <a
              href="https://www.instagram.com/spejavasection/"
              className="inline-link"
            >
              Follow section announcements
              <Arrow />
            </a>
          </div>
        )}
      </section>
      {undated.length > 0 && (
        <section
          className="section"
          aria-label="Events awaiting confirmed dates"
        >
          <div className="section-title">
            <h2>Dates to be confirmed</h2>
          </div>
          {undated.map((post) => (
            <EventTray key={post.slug} post={post} />
          ))}
        </section>
      )}
      <section className="section" aria-label="Past events">
        <div className="section-title">
          <h2>Deeper in the archive</h2>
          <a href="/aes">
            Annual Energy Symposium
            <Arrow />
          </a>
        </div>
        <p>
          Past announcements are preserved for reference. Historical prices,
          deadlines and registration invitations are not current offers.
        </p>
        {years.map((year) => (
          <div key={year}>
            <p className="year-title">
              {year || 'Date TBC'}
              <span>PAST</span>
            </p>
            {archive
              .filter((post) => post.event!.start.startsWith(year))
              .map((post) => (
                <EventTray key={post.slug} post={post} />
              ))}
          </div>
        ))}
        {!archive.length && <p>No archived events match this type.</p>}
      </section>
      <noscript>
        <p className="noscript">
          All events are listed. Filtering requires JavaScript.
        </p>
      </noscript>
    </>
  )
}
