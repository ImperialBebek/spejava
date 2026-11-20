export default function MembershipPage() {
  return (
    <>
      <section className="page-head grid">
        <div className="rail">2026</div>
        <div className="head-copy">
          <h1>
            Local connections.
            <br />
            Global membership.
          </h1>
          <p className="lead">
            Join or renew through SPE International. SPE Java is your local
            section for knowledge-sharing, events and student chapter
            connections.
          </p>
        </div>
      </section>
      <div className="actions" style={{ margin: '0 0 48px' }}>
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
          Renew on spe.org
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
      <section className="section">
        <div className="section-title">
          <h2>Who is membership for?</h2>
        </div>
        <div className="grid">
          <div className="benefit">
            <h3>Professionals</h3>
            <p>
              Early- and mid-career energy professionals who want to exchange
              technical knowledge, meet peers and contribute to the local
              community.
            </p>
          </div>
          <div className="benefit">
            <h3>Students</h3>
            <p>
              University students looking for technical learning, mentoring and
              a community that connects campus with professional life.
            </p>
            <a href="/student-chapter" className="inline-link">
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
      <section className="section grid two-col">
        <div className="copy">
          <h2>What happens on spe.org?</h2>
          <ol className="steps">
            <li>
              <h3>Create or access your account.</h3>
              <p>
                SPE International handles your member account, eligibility and
                membership category.
              </p>
            </li>
            <li>
              <h3>Review the current terms.</h3>
              <p>
                Check fees, eligibility and membership conditions before paying.
                Java Section does not set international fees.
              </p>
            </li>
            <li>
              <h3>Connect locally.</h3>
              <p>
                After joining, explore section events and your university
                chapter where applicable.
              </p>
            </li>
          </ol>
        </div>
        <aside className="aside">
          <h2>Fees</h2>
          <p className="stamp">[set by SPE International, see spe.org]</p>
          <p>No local price is quoted here.</p>
          <span className="stamp tbc">
            [TBC: approve local membership guidance]
          </span>
        </aside>
      </section>
      <section className="section faq">
        <h2 style={{ marginBottom: '28px' }}>Questions before you join</h2>
        <details open={true}>
          <summary>Do I join SPE Java separately?</summary>
          <p>
            International membership is handled on spe.org. Contact the section
            for approved guidance on your local affiliation and activities.
          </p>
        </details>
        <details open={true}>
          <summary>How do I renew?</summary>
          <p>
            Follow the renewal link to SPE International and sign in to your
            member account to review your renewal options.
          </p>
        </details>
        <details open={true}>
          <summary>What can I do locally?</summary>
          <p>
            The site documents technical talks, workshops, the Annual Energy
            Symposium, student chapter support and mentoring. Check each program
            for current availability.
          </p>
        </details>
        <details open={true}>
          <summary>Are event fees included?</summary>
          <p>
            Do not assume membership includes event registration. The HPHT
            workshop source mentions a special member rate; terms vary by event.
          </p>
        </details>
        <details open={true}>
          <summary>Who can help with a membership question?</summary>
          <p>
            Use the Membership enquiry on the Contact page.{' '}
            <span className="stamp tbc">
              [TBC: approved contact and response expectation]
            </span>
          </p>
        </details>
      </section>
      <section className="section">
        <h2>Take your next step.</h2>
        <div className="actions">
          <a className="button" href="https://www.spe.org/en/join/">
            Join SPE International
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
          <a className="button secondary" href="/contact?enquiry=Membership">
            Ask a membership question
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
    </>
  )
}
