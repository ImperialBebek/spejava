import { LatestStories, LatestEvent, useSortedPosts } from '../components'
import { isPastEvent } from '../model'
import { staticEarth } from '../generated-earth'
import { EventTray } from './events'

export default function HomePage() {
  const upcoming = useSortedPosts()
    .filter(
      (post) =>
        post.kind === 'event' &&
        !post.reviewRequired &&
        post.event?.start &&
        !isPastEvent(post.event),
    )
    .sort((a, b) => a.event!.start.localeCompare(b.event!.start))
    .slice(0, 3)
  return (
    <>
      <section className="home-hero grid">
        <div className="rail" aria-label="Section timeline">
          <span className="year-current">2026</span>
          <span className="year-award">2025</span>
          <span style={{ bottom: '95px' }}>2024</span>
          <span className="year-founded">1979</span>
        </div>
        <div className="intro">
          <h1>The Society of Petroleum Engineers, Java Section</h1>
          <p className="lead">Knowledge connects Java’s energy community.</p>
          <div className="actions">
            <a className="button" href="/membership">
              Join or renew
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
            <a className="button secondary" href="/student-chapter">
              Find your student chapter
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
          </div>
          <p className="hero-origin mono">Founded 25 June 1979 · Jakarta</p>
        </div>
        <figure
          className="ascii-panel earth-surface"
          role="group"
          aria-label="Rotating Earth with Indonesia highlighted in blue"
        >
          <button
            type="button"
            className="earth-stage earth-toggle"
            data-earth-control
            aria-label="Earth with Indonesia highlighted in blue"
            aria-pressed="false"
            disabled
          >
            <pre
              className="ascii-art"
              data-doop-id="rmrk1w"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: staticEarth }}
            />
            <span className="earth-limb" aria-hidden="true"></span>
          </button>
        </figure>
      </section>
      <LatestEvent />
      <section
        className="section-scale mono"
        aria-label="Section scale, awaiting approval"
      >
        <div>
          Members <span className="stamp tbc">[TBC: member count]</span>
        </div>
        <div>
          Student members{' '}
          <span className="stamp tbc">[TBC: student member count]</span>
        </div>
        <div>
          Chapters <span className="stamp tbc">[TBC: chapter count]</span>
        </div>
        <div className="scale-date">
          As of <span className="stamp tbc">[TBC: reporting date]</span>
        </div>
      </section>
      <div className="photo-strip">
        <figure>
          <img
            className=""
            src="/media/bD0itTr5ln7pSnWwDI3aAHRnmAI.webp"
            alt="SPE Java students and participants at the Asia Pacific Student Paper Contest 2025"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="meta">
            <span>
              APOGCE 2025 · Java’s student community on the regional stage.
            </span>
            <span>JAVA SECTION · EST. 25 JUN 1979</span>
          </figcaption>
        </figure>
      </div>
      <section className="section">
        <div className="section-title">
          <h2>At the surface</h2>
          <a href="/events">
            Explore the event archive
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6"></path>
            </svg>
          </a>
        </div>
        {upcoming.length ? (
          upcoming.map((post) => <EventTray key={post.slug} post={post} />)
        ) : (
          <div className="empty">
            <div>
              <h3>
                Next events:{' '}
                <span className="stamp tbc">[TBC, announced soon]</span>
              </h3>
              <p style={{ marginTop: '12px' }}>
                No upcoming event is confirmed here yet.
              </p>
            </div>
            <a
              className="button secondary"
              href="https://www.instagram.com/spejavasection/"
            >
              Follow event announcements
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
          </div>
        )}
      </section>
      <section className="section">
        <div className="section-title">
          <h2>Find your way in.</h2>
        </div>
        <div className="grid pathways">
          <div className="path">
            <h3>For members</h3>
            <p>
              Exchange technical knowledge and meet peers. Young Professionals
              and experienced members can explore local learning and
              connections.
            </p>
            <a className="button secondary" href="/membership">
              Join or renew
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
          </div>
          <div className="path">
            <h3>For students</h3>
            <p>
              Start with your university chapter. Learn alongside students and
              professionals.
            </p>
            <a className="button secondary" href="/student-chapter">
              Find your chapter
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
          </div>
          <div className="path">
            <h3>Get involved</h3>
            <p>
              Ask about volunteering or committee work and how your skills could
              support the section.
            </p>
            <a className="button secondary" href="/contact?enquiry=General">
              Ask about volunteering
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
            <span className="stamp tbc">
              [TBC: current volunteer opportunities]
            </span>
          </div>
        </div>
        <div className="partner-row">
          <p>
            <strong>For partners</strong> · Help make local knowledge-sharing
            possible.
          </p>
          <a className="inline-link" href="/contact?enquiry=Partnership">
            Partner with us
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6"></path>
            </svg>
          </a>
        </div>
      </section>
      <section className="membership-band blue grid">
        <div className="band-heading">
          <h2>
            One membership.
            <br />A local community.
            <br />A global network.
          </h2>
          <div className="actions">
            <a className="button" href="https://www.spe.org/en/join/">
              Join on spe.org
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
            <a
              className="button secondary"
              href="https://www.spe.org/en/members/renew/"
            >
              Renew membership
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
          </div>
        </div>
        <div className="band-body">
          <h3>Here in Java</h3>
          <ul>
            <li>
              Technical knowledge-sharing through talks, workshops and AES.
            </li>
            <li>
              Student chapter activities, mentoring and professional
              connections.
            </li>
          </ul>
          <h3 style={{ marginTop: '28px' }}>Through SPE International</h3>
          <p style={{ marginTop: '16px' }}>
            Create or sign in to your SPE account to join or renew. SPE
            International manages membership eligibility, fees and payment.
          </p>
          <a className="inline-link" href="/membership">
            Understand membership
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6"></path>
            </svg>
          </a>
        </div>
      </section>
      <LatestStories />
      <section className="trust">
        <h2>Regional Outstanding Section 2025</h2>
        <a
          className="inline-link"
          href="/articles/spe-java-section-named-regional-outstanding-section-2025"
        >
          Read the recognition
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6"></path>
          </svg>
        </a>
      </section>
    </>
  )
}
