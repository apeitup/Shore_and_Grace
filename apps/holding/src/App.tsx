import { FormEvent, useState } from 'react'
import { Facebook, Instagram, Pinterest, Youtube } from 'iconoir-react'

type SocialName = 'Facebook' | 'Instagram' | 'Pinterest' | 'YouTube' | 'Etsy'

const socialLinks: Record<SocialName, string | null> = {
  Facebook: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/profile.php?id=61594766006657',
  Instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/shore_and_grace',
  Pinterest: import.meta.env.VITE_PINTEREST_URL || 'https://pin.it/3d5EAgITz',
  YouTube: import.meta.env.VITE_YOUTUBE_URL || 'https://www.youtube.com/@shoreandgrace',
  Etsy: import.meta.env.VITE_ETSY_URL || 'https://shoreandgrace.etsy.com/',
}

function Brand() {
  return (
    <a className="brand" href="/" aria-label="Shore & Grace home">
      <img className="brand__botanical" src="/assets/botanical-mark.svg" alt="" />
      <span className="brand__wordmark">
        <span className="brand__name">Shore &amp; Grace</span>
        <span className="brand__descriptor">Floral &amp; Gift Studio</span>
      </span>
    </a>
  )
}

function SocialIcon({ name }: { name: SocialName }) {
  const props = { width: 18, height: 18, strokeWidth: 1.5, 'aria-hidden': true }

  if (name === 'Facebook') return <Facebook {...props} />
  if (name === 'Instagram') return <Instagram {...props} />
  if (name === 'Pinterest') return <Pinterest {...props} />
  if (name === 'YouTube') return <Youtube {...props} />
  return <span className="etsy-mark" aria-hidden="true">E</span>
}

function SocialLinks({ mobile = false }: { mobile?: boolean }) {
  const names: SocialName[] = mobile
    ? ['Facebook', 'Instagram', 'Pinterest', 'YouTube', 'Etsy']
    : ['Facebook', 'Instagram', 'Etsy']

  return (
    <nav className={`socials${mobile ? ' socials--mobile' : ''}`} aria-label="Social media">
      {names.map((name) => {
        const href = socialLinks[name]

        if (!href) {
          return (
            <span
              className="socials__link socials__link--pending"
              aria-label={`${name} link coming soon`}
              title={`${name} link coming soon`}
              key={name}
            >
              <SocialIcon name={name} />
            </span>
          )
        }

        return (
          <a
            className="socials__link"
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Visit Shore & Grace on ${name}`}
            key={name}
          >
            <SocialIcon name={name} />
          </a>
        )
      })}
    </nav>
  )
}

function SignupForm() {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const endpoint = import.meta.env.VITE_SIGNUP_ENDPOINT || (import.meta.env.PROD ? '/api/signup' : '')

    if (!endpoint) {
      setMessage('Thank you — signup will be available very soon.')
      return
    }

    setIsSending(true)
    setMessage('Sending…')
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          consent: data.get('consent') === 'yes',
          consentVersion: 'launch_updates_v1_2026-10-18',
          website: data.get('website'),
        }),
      })
      if (!response.ok) throw new Error('Signup request failed')
      form.reset()
      setMessage('Thank you. We’ll let you know when we bloom.')
    } catch {
      setMessage('We couldn’t save that just now. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="signup">
      <h2>Be the first to know when we bloom.</h2>
      <form className="signup__form" onSubmit={handleSubmit}>
        <div className="signup__fields">
          <label className="sr-only" htmlFor="email">Your email address</label>
          <input id="email" name="email" type="email" placeholder="Your email address" autoComplete="email" required />
          <label className="signup__honeypot" aria-hidden="true">
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
          <button type="submit" disabled={isSending}>{isSending ? 'Sending…' : 'Notify me'}</button>
        </div>
        <label className="signup__consent">
          <input name="consent" type="checkbox" value="yes" required />
          <span>I agree to receive the Shore &amp; Grace launch announcement and occasional floral inspiration. I can unsubscribe at any time. See the <a href="/privacy/">Privacy Policy</a>.</span>
        </label>
      </form>
      <p className="signup__message" aria-live="polite">{message}</p>
    </div>
  )
}

function LaunchAnnouncement() {
  return (
    <section className="announcement" aria-labelledby="holding-title">
      <div className="launch-status">
        <span aria-hidden="true" />
        <p>Our new website is coming soon</p>
      </div>
      <h1 id="holding-title">Something lovely<br />is blooming.</h1>
      <p className="announcement__intro">
        We’re tending to the final details of our new online home. Thoughtful fresh and faux flowers, meaningful gifts, bespoke funeral tributes and a little everyday beauty are coming soon to the Essex coast.
      </p>
      <SignupForm />
    </section>
  )
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Brand />
        <div className="site-header__aside">
          <p>A little beauty is on its way</p>
          <SocialLinks />
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-container site-footer__inner">
        <p className="site-footer__motto">Thoughtfully gathered. Beautifully remembered.</p>
        <SocialLinks mobile />
        <p className="site-footer__copyright">© 2026 Shore &amp; Grace. All rights reserved.</p>
        <a className="site-footer__privacy" href="/privacy/">Privacy Policy</a>
      </div>
    </footer>
  )
}

function HoldingPage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <div className="mobile-hero" aria-hidden="true">
          <img src="/assets/hero-mobile.png" alt="" />
          <span />
        </div>
        <div className="hero">
          <picture className="hero__image" aria-hidden="true">
            <source media="(max-width: 1350px)" srcSet="/assets/hero-tablet.png" />
            <img src="/assets/hero-desktop.png" alt="" />
          </picture>
          <div className="hero__veil" aria-hidden="true" />
          <div className="page-container hero__inner">
            <LaunchAnnouncement />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function PrivacyPage() {
  return (
    <div className="site-shell">
      <title>Privacy Policy | Shore &amp; Grace</title>
      <meta
        name="description"
        content="How Shore & Grace handles personal information on the shoreandgrace.com holding website."
      />
      <link rel="canonical" href="https://shoreandgrace.com/privacy/" />
      <SiteHeader />

      <main className="privacy-page">
        <article className="privacy-page__content">
          <p className="privacy-page__eyebrow">Your privacy</p>
          <h1>Privacy Policy</h1>
          <p className="privacy-page__updated">Last updated 18 October 2026</p>

          <p>
            Shore &amp; Grace respects your privacy. This notice explains how we handle personal information on our temporary holding website.
          </p>

          <h2>Who we are</h2>
          <p>
            Shore &amp; Grace is a floral and gift studio serving Walton-on-the-Naze, Clacton-on-Sea and surrounding areas. For privacy questions, email <a href="mailto:info@shoreandgrace.com">info@shoreandgrace.com</a>.
          </p>

          <h2>Information we collect</h2>
          <p>
            If you join our launch list, we collect your email address, the date and time you subscribed, the consent wording you agreed to and the page used to subscribe. We use this information with your consent to send our launch announcement and occasional floral inspiration. You can withdraw your consent at any time by contacting us.
          </p>
          <p>
            Subscription records are stored in a private database on the server used to host this website. They are not accessible through the public website. Our hosting provider may also process limited technical information, such as IP addresses, browser details and request times, in server logs needed to operate and protect the website.
          </p>

          <h2>Cookies and analytics</h2>
          <p>
            We do not currently use analytics, advertising cookies or other non-essential tracking technologies on this website.
          </p>

          <h2>How we use and share information</h2>
          <p>
            Launch-list information is used only for the communications described when you subscribe. Technical log information is used only to keep the website secure, available and working correctly. We do not sell personal information. Information may be handled by service providers only where needed to host, secure or maintain the website, or where the law requires it.
          </p>

          <h2>How long information is kept</h2>
          <p>
            We keep launch-list information until you unsubscribe or withdraw consent, or until it is no longer needed for the stated purpose. We periodically review and remove information we no longer need. Technical logs are kept only for as long as reasonably necessary for security, troubleshooting and legal purposes, in line with our hosting arrangements.
          </p>

          <h2>Your rights</h2>
          <p>
            UK data protection law may give you rights to ask for access to, correction of, deletion of or restriction on the use of your personal information, and to object to certain processing. Contact us using the email address above. You can also complain to the <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">Information Commissioner’s Office</a>.
          </p>

          <h2>Changes to this notice</h2>
          <p>
            We will update this policy when a mailing provider is introduced and again when the full online shop, payments, delivery tools or analytics are introduced.
          </p>

          <a className="privacy-page__back" href="/">Return to the holding page</a>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}

function App() {
  const isPrivacyPage = window.location.pathname === '/privacy' || window.location.pathname === '/privacy/'
  return isPrivacyPage ? <PrivacyPage /> : <HoldingPage />
}

export default App
