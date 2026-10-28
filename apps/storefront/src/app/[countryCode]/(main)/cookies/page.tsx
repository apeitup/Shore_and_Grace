import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import CookieSettingsButton from "@modules/layout/components/cookie-settings-button"
import { PolicyPage } from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Cookie policy",
  description: `Cookies and browser storage used by ${STORE_NAME}.`,
}

const firstPartyCookies = [
  {
    name: "sg_cookie_consent",
    purpose: "Stores your optional cookie choices and the consent version.",
    duration: "180 days",
    category: "Essential",
  },
  {
    name: "_medusa_cache_id",
    purpose: "Keeps cached storefront data isolated and up to date.",
    duration: "24 hours",
    category: "Essential",
  },
  {
    name: "_medusa_cart_id",
    purpose: "Connects your browser to the basket you created.",
    duration: "7 days",
    category: "Essential",
  },
  {
    name: "_medusa_jwt",
    purpose: "Keeps an authenticated customer securely signed in.",
    duration: "Session, or 7 days when Remember me is selected",
    category: "Essential",
  },
  {
    name: "_medusa_pending_customer",
    purpose:
      "Temporarily preserves registration details during email verification.",
    duration: "24 hours",
    category: "Essential",
  },
  {
    name: "_medusa_locale",
    purpose: "Remembers a locale explicitly selected by the visitor.",
    duration: "1 year",
    category: "Requested preference",
  },
]

const browserStorage = [
  {
    name: "sg_posthog",
    purpose:
      "Stores an anonymous analytics identifier and pageview context after analytics consent.",
    duration: "Until consent is withdrawn or browser storage is cleared",
    category: "Analytics",
  },
  {
    name: "sg-recently-viewed-enabled",
    purpose:
      "Records whether recently viewed products are enabled on this device.",
    duration: "Until changed or browser storage is cleared",
    category: "Personalisation",
  },
  {
    name: "sg-recently-viewed-products",
    purpose:
      "Stores a short list of product identifiers viewed on this device.",
    duration: "Until disabled or browser storage is cleared",
    category: "Personalisation",
  },
  {
    name: "sg-account-notifications",
    purpose: "Stores notification-interface choices on this device.",
    duration: "Until changed or browser storage is cleared",
    category: "Requested preference",
  },
]

function StorageTable({
  rows,
}: {
  rows: Array<{
    name: string
    purpose: string
    duration: string
    category: string
  }>
}) {
  return (
    <div className="sg-policy-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>{row.purpose}</td>
              <td>{row.duration}</td>
              <td>{row.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CookiePolicyPage() {
  return (
    <PolicyPage
      title="Cookie policy"
      eyebrow="YOUR CHOICES"
      updated="28 October 2026"
    >
      <p>
        This policy explains how {STORE_NAME} uses cookies and similar browser
        storage. Essential technologies keep the store secure and provide
        features you request. Optional technologies remain off unless you choose
        to enable them.
      </p>

      <CookieSettingsButton className="sg-policy-cookie-button" />

      <section>
        <h2>First-party cookies</h2>
        <StorageTable rows={firstPartyCookies} />
      </section>

      <section>
        <h2>Browser storage</h2>
        <p>
          Browser storage is similar to a cookie but remains in the browser. The
          recently viewed list is written only when both the account setting and
          personalisation consent are enabled, and it is removed when that
          consent is withdrawn.
        </p>
        <StorageTable rows={browserStorage} />
      </section>

      <section>
        <h2>Stripe payment technologies</h2>
        <p>
          When Stripe is available at checkout, Stripe.js may use technologies
          such as <code>__stripe_mid</code>, <code>__stripe_sid</code> and{" "}
          <code>m</code> for payment security and fraud prevention. Stripe may
          also use Link authentication technologies if that feature is enabled.
          These are loaded in the checkout context to provide the secure payment
          service requested by the customer. Stripe controls the exact names and
          durations and may update them.
        </p>
        <p>
          Read the{" "}
          <a
            href="https://stripe.com/legal/privacy-center"
            target="_blank"
            rel="noreferrer"
          >
            Stripe Privacy Center
          </a>{" "}
          for its current information.
        </p>
      </section>

      <section>
        <h2>PostHog analytics</h2>
        <p>
          If you enable analytics, the storefront initialises PostHog to record
          anonymous pageviews and understand how the store is used. The locally
          bundled analytics code cannot initialise, store analytics identifiers
          or transmit analytics data before consent. Its local storage is
          disabled when that consent is withdrawn. Session replay, surveys and
          automatic interaction capture are disabled in this first
          implementation.
        </p>
        <p>
          Read PostHog&apos;s{" "}
          <a
            href="https://posthog.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            privacy information
          </a>
          .
        </p>
        <p>
          We do not currently load advertising scripts. Any future optional
          analytics or marketing service must be added to this policy and
          technically blocked until the matching consent is active.
        </p>
      </section>

      <section>
        <h2>Changing your choice</h2>
        <p>
          Use Cookie settings in the footer at any time. Declining optional
          cookies does not prevent you from browsing, adding products to your
          basket or checking out. You can also clear cookies using your browser,
          although this may sign you out or empty your basket.
        </p>
      </section>
    </PolicyPage>
  )
}
