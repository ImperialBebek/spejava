import { Markdown } from '../richtext'
import {
  ButtonLink,
  LatestStories,
  PageHeading,
  Stamp,
  Tbc,
} from '../components'
import { useContent } from '../data'
import { displayDate, isEditionOpen, postPath, type Program } from '../model'

export default function ProgramPage({ program }: { program: Program }) {
  const { posts } = useContent()
  const aes = program.slug === 'aes'
  const archive = posts.find(
    (post) => post.slug === (aes ? 'aes2025' : 'scholarship-program-2025'),
  )
  const editions = [...(program.editions || [])].sort((a, b) => b.year - a.year)
  const active = editions.filter((edition) => isEditionOpen(edition))
  return (
    <div className={aes ? 'aes-program' : undefined}>
      <PageHeading title={program.title} rail={aes ? 'AES' : 'STUDENTS'} />
      {active.length ? (
        active.map((edition) => (
          <section className="section" key={edition.year}>
            <Stamp>OPEN</Stamp>
            <h2>{edition.title}</h2>
            <p className="meta">
              Applications: {displayDate(edition.opens)} to{' '}
              {displayDate(edition.closes)} · Asia/Jakarta
            </p>
            <Markdown blocks={edition.bodyBlocks}>{edition.body}</Markdown>
            <ButtonLink href={edition.registrationUrl}>
              {aes
                ? 'Register with the organiser'
                : 'Apply through the approved form'}
            </ButtonLink>
            {edition.sponsors.some((sponsor) => sponsor.approved) && (
              <aside className="section">
                <h3>Edition supporters</h3>
                <div className="supporters">
                  {edition.sponsors
                    .filter((sponsor) => sponsor.approved)
                    .map((sponsor) => (
                      <div key={sponsor.name}>
                        {sponsor.image && (
                          <img
                            src={sponsor.image}
                            alt={sponsor.alt}
                            width="160"
                            height="96"
                            loading="lazy"
                          />
                        )}
                        {sponsor.website ? (
                          <a href={sponsor.website}>{sponsor.name}</a>
                        ) : (
                          <span>{sponsor.name}</span>
                        )}
                      </div>
                    ))}
                </div>
              </aside>
            )}
          </section>
        ))
      ) : (
        <aside className="notice">
          <Stamp>{aes ? 'EDITION ARCHIVE' : 'PROGRAM STATUS · TBC'}</Stamp>
          <p>
            {aes
              ? 'Past edition information is preserved below. Historical dates, prices and registration invitations are not current offers.'
              : 'No current scholarship intake is confirmed here. Historical announcements do not indicate that applications are open.'}
          </p>
          <Tbc>
            {aes
              ? 'next confirmed edition and approved sponsor roster'
              : 'next application round and eligibility'}
          </Tbc>
        </aside>
      )}
      {aes && program.year === 2025 && archive?.image && (
        <figure className="article-photo">
          <img
            src={archive.image}
            alt={archive.alt}
            width={archive.imageWidth}
            height={archive.imageHeight}
          />
          <figcaption className="meta">
            Original AES 2025 edition artwork.
          </figcaption>
        </figure>
      )}
      <div className="article-layout grid">
        <article className="reading">
          <Markdown archive blocks={program.bodyBlocks}>
            {program.body}
          </Markdown>
        </article>
      </div>
      {editions
        .filter((edition) => !isEditionOpen(edition))
        .map((edition) => (
          <section className="section" key={edition.year}>
            <h2>{edition.title}</h2>
            <Stamp>{edition.status === 'tbc' ? 'TBC' : 'CLOSED'}</Stamp>
            <Markdown archive blocks={edition.bodyBlocks}>
              {edition.body}
            </Markdown>
          </section>
        ))}
      <section className="section">
        <div className="section-title">
          <h2>{aes ? 'Explore the edition archive' : 'Scholarship archive'}</h2>
        </div>
        {archive && (
          <ButtonLink href={postPath(archive)}>
            {aes ? 'AES 2025 announcement' : 'Scholarship Program 2025'}
          </ButtonLink>
        )}
        <div className="actions">
          <ButtonLink href={aes ? '/events' : '/student-chapter'} secondary>
            {aes ? 'All events' : 'Find your student chapter'}
          </ButtonLink>
          <ButtonLink href="/contact?enquiry=General" secondary>
            Ask the section
          </ButtonLink>
        </div>
      </section>
      <LatestStories />
    </div>
  )
}
