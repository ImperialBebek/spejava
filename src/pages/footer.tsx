export default function Footer() {
  return (
    <footer className="site-footer">
      <section
        className="footer-newsletter grid"
        aria-labelledby="newsletter-title"
      >
        <div className="newsletter-copy">
          <span className="mono">SECTION NEWSLETTER</span>
          <h2 id="newsletter-title">Keep in the loop.</h2>
          <p>Sign up for section news.</p>
          <span className="stamp tbc">[TBC: provider and frequency]</span>
        </div>
        <form
          id="newsletter-form"
          className="newsletter-form"
          action="/#newsletter-status"
          method="post"
        >
          <fieldset disabled={true}>
            <label htmlFor="newsletter-email">Email address (required)</label>
            <div className="newsletter-controls">
              <input
                id="newsletter-email"
                name="newsletter_email"
                type="email"
                autoComplete="email"
                required={true}
                aria-describedby="newsletter-help newsletter-privacy"
              />
              <button className="button" type="submit">
                Sign up
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </button>
            </div>
          </fieldset>
          <p id="newsletter-help" className="newsletter-help">
            Preview only. This form does not subscribe you or transmit your
            email.
          </p>
          <p id="newsletter-privacy" className="newsletter-privacy">
            <span className="stamp tbc">
              [TBC: approved newsletter consent copy]
            </span>
          </p>
          <p
            id="newsletter-status"
            className="newsletter-status"
            role="status"
            hidden={true}
          ></p>
        </form>
      </section>
      <div className="grid">
        <div className="footer-brand">
          <a href="/" className="brand" aria-label="SPE Java Section home">
            <img src="/images/spe-logo.svg" alt="" width="74" height="40" />
            <span>
              Java
              <br />
              Section
            </span>
          </a>
          <p style={{ marginTop: '24px' }}>
            Sharing knowledge.
            <br />
            Connecting the Java energy community.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/events">Events</a>
          <a href="/blog">Stories</a>
          <a href="/student-chapter">Students</a>
          <a href="/membership">Membership</a>
          <a href="/contact">Contact</a>
          <a href="/admin/">Content editor</a>
        </nav>
        <div className="footer-contact">
          <a href="mailto:office@spejava.com">office@spejava.com</a>
          <br />
          <span className="stamp tbc">[TBC: approve direct email]</span>
          <br />
          <a href="https://www.instagram.com/spejavasection/">Instagram</a>
          <br />
          <a href="https://www.spe.org/">SPE International</a>
        </div>
      </div>
      <div className="footer-bottom meta">
        <p>Society of Petroleum Engineers · Java Section</p>
        <p>Content status checked 19 Nov 2026</p>
      </div>
    </footer>
  )
}
