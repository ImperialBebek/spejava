import { useEffect } from 'react'

export default function ContactPage() {
  useEffect(() => {
    const value = new URLSearchParams(window.location.search)
      .get('enquiry')
      ?.toLowerCase()
    const select = document.getElementById(
      'enquiry',
    ) as HTMLSelectElement | null
    const option =
      select &&
      [...select.options].find((item) => item.value.toLowerCase() === value)
    if (select && option) select.value = option.value
  }, [])
  return (
    <>
      <section className="page-head grid">
        <div className="rail">2026</div>
        <div className="head-copy">
          <h1>Start a conversation.</h1>
          <p className="lead">
            Questions about membership, student chapters, events or
            partnerships? Tell us what you need.
          </p>
        </div>
      </section>
      <section className="grid">
        <div className="contact-form">
          <div className="notice">
            <p>
              <strong>Local design preview.</strong> This form does not transmit
              messages.{' '}
              <span className="stamp tbc">
                [TBC: approved form delivery endpoint]
              </span>
            </p>
          </div>
          <form
            onSubmit={(event) => event.preventDefault()}
            id="contact-form"
            action="/contact#form-status"
            method="post"
          >
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">Name (required)</label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required={true}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email address (required)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required={true}
                />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number (optional)</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" />
              </div>
              <div className="field">
                <label htmlFor="enquiry">Enquiry type (required)</label>
                <select id="enquiry" name="enquiry_type" required={true}>
                  <option value="">Choose enquiry type</option>
                  <option>General</option>
                  <option>Membership</option>
                  <option>Partnership</option>
                  <option>Student chapter</option>
                  <option>Media</option>
                </select>
              </div>
              <div className="field full">
                <label htmlFor="subject">Subject (required)</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required={true}
                />
              </div>
              <div className="field full">
                <label htmlFor="message">Message (required)</label>
                <textarea
                  id="message"
                  name="message"
                  required={true}
                  placeholder="How can the section help?"
                ></textarea>
              </div>
            </div>
            <p className="meta">
              Please do not include sensitive personal or payment information.{' '}
              <span className="stamp tbc">[TBC: approved privacy notice]</span>
            </p>
            <button className="button" type="submit" disabled={true}>
              Send message
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
            <p
              id="form-status"
              className="notice ajax-status"
              role="status"
              tabIndex={-1}
              hidden={true}
            ></p>
          </form>
        </div>
        <aside className="contact-aside">
          <h2>Direct contact</h2>
          <p>
            <a href="mailto:office@spejava.com">office@spejava.com</a>
            <br />
            <span className="stamp tbc">[TBC: approve direct email]</span>
          </p>
          <h2 style={{ marginTop: '36px' }}>When will we reply?</h2>
          <p>
            <span className="stamp tbc">[TBC: response expectation]</span>
          </p>
          <h2 style={{ marginTop: '36px' }}>Find us on Instagram</h2>
          <a
            className="inline-link"
            href="https://www.instagram.com/spejavasection/"
          >
            @spejavasection
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
          <p className="meta">
            Follow public section updates and event announcements.
          </p>
        </aside>
      </section>
    </>
  )
}
