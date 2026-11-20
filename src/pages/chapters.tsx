import { Markdown } from '../richtext'
import { useState } from 'react'
import {
  Arrow,
  ButtonLink,
  LatestStories,
  PageHeading,
  Tbc,
} from '../components'
import { useContent } from '../data'
import type { Chapter } from '../model'

function JoinSteps() {
  return (
    <ol className="steps">
      <li>
        <h3>Find your university.</h3>
        <p>
          Use the directory to identify your chapter. If your university is not
          listed, ask SPE Java for guidance.
        </p>
      </li>
      <li>
        <h3>Ask about local activities.</h3>
        <p>
          Contact the chapter through its approved channel, or ask the section
          to help you connect.
        </p>
      </li>
      <li>
        <h3>Join through SPE International.</h3>
        <p>
          Check student eligibility and membership requirements on spe.org. Your
          chapter can help you get involved locally.
        </p>
      </li>
    </ol>
  )
}

export default function ChaptersPage() {
  const { chapters } = useContent()
  const [query, setQuery] = useState('')
  const visible = chapters.filter((chapter) =>
    chapter.name
      .toLocaleLowerCase('en')
      .includes(query.trim().toLocaleLowerCase('en')),
  )
  return (
    <>
      <PageHeading
        title="Find your SPE student chapter."
        lead="A local starting point for technical learning, professional connections and student-led ideas."
      />
      <div className="notice">
        <p>
          The legacy directory lists {chapters.length} unique universities.{' '}
          <Tbc>approved current chapter roster and count</Tbc>
        </p>
      </div>
      <div className="directory-tools grid">
        <div className="field search-field">
          <label htmlFor="chapter-search">Search university name</label>
          <input
            id="chapter-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Bandung Institute of Technology"
          />
        </div>
        <div className="field city-field">
          <label htmlFor="city">City</label>
          <select id="city" disabled aria-describedby="city-help">
            <option>All cities — details TBC</option>
          </select>
          <span id="city-help" className="meta">
            <Tbc>verified city list</Tbc>
          </span>
        </div>
      </div>
      <p className="meta search-state" role="status">
        {visible.length} {visible.length === 1 ? 'university' : 'universities'}{' '}
        in the legacy directory
      </p>
      <section aria-label="Student chapter directory" className="grid">
        {visible.map((chapter) => (
          <article className="chapter" key={chapter.slug}>
            {chapter.image && (
              <img
                src={chapter.image}
                alt={`${chapter.name} emblem`}
                width="76"
                height="76"
                loading="lazy"
                decoding="async"
              />
            )}
            <div>
              <h2>{chapter.name}</h2>
              {chapter.city || <Tbc>city</Tbc>}
              <p>
                <Tbc>chapter contact</Tbc>
              </p>
              <a href={`/student-chapter/${chapter.slug}`}>
                Explore the chapter
                <Arrow />
              </a>
            </div>
          </article>
        ))}
      </section>
      {!visible.length && (
        <div className="empty">
          <p>No university matches “{query}”.</p>
          <button type="button" className="chip" onClick={() => setQuery('')}>
            Clear search
          </button>
        </div>
      )}
      <noscript>
        <p className="noscript">
          All chapters are listed. Search requires JavaScript.
        </p>
      </noscript>
      <section className="section">
        <div className="section-title">
          <h2>How to join</h2>
        </div>
        <JoinSteps />
        <div className="actions">
          <ButtonLink href="https://www.spe.org/en/join/">
            Student membership on spe.org
          </ButtonLink>
          <ButtonLink href="/scholarship" secondary>
            Scholarship information
          </ButtonLink>
        </div>
      </section>
      <LatestStories title="Latest chapter stories" />
    </>
  )
}

export function ChapterPage({ chapter }: { chapter: Chapter }) {
  return (
    <>
      <section className="page-head grid">
        <div className="rail">STUDENTS</div>
        <div className="chapter-intro">
          <a href="/student-chapter" className="back">
            <Arrow />
            All student chapters
          </a>
          <h1>SPE {chapter.name} Student Chapter</h1>
          {chapter.description && <p className="lead">{chapter.description}</p>}
        </div>
        {chapter.image && (
          <figure className="chapter-emblem">
            <img
              src={chapter.image}
              alt={`${chapter.name} emblem`}
              width="240"
              height="240"
            />
          </figure>
        )}
      </section>
      <section className="section two-col grid">
        <div className="copy">
          <h2>A local starting point.</h2>
          {chapter.body || chapter.bodyBlocks?.length ? (
            <Markdown blocks={chapter.bodyBlocks}>{chapter.body}</Markdown>
          ) : (
            <p>
              <Tbc>approved chapter introduction</Tbc>
            </p>
          )}
          <p>
            The current chapter roster, contacts and leadership term are
            awaiting SPE Java’s confirmation.
          </p>
        </div>
        <aside className="aside">
          <h2>Connect with the chapter</h2>
          <dl className="facts">
            <div>
              <dt>CITY</dt>
              <dd>{chapter.city || <Tbc>city</Tbc>}</dd>
            </div>
            <div>
              <dt>CONTACT</dt>
              <dd>
                {chapter.email ? (
                  <a href={`mailto:${chapter.email}`}>{chapter.email}</a>
                ) : (
                  <Tbc>approved contact</Tbc>
                )}
              </dd>
            </div>
            <div>
              <dt>LEADERSHIP TERM</dt>
              <dd>
                <Tbc>current term</Tbc>
              </dd>
            </div>
          </dl>
          {chapter.website && (
            <a href={chapter.website} className="inline-link">
              Chapter website
              <Arrow />
            </a>
          )}
          <ButtonLink href="/contact?enquiry=Student+chapter" secondary>
            Ask SPE Java to connect you
          </ButtonLink>
        </aside>
      </section>
      <section className="section">
        <div className="section-title">
          <h2>How to get involved</h2>
        </div>
        <JoinSteps />
      </section>
      <LatestStories title="From the chapter community" />
    </>
  )
}
