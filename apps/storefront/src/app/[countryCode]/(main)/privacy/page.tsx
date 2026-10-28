import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PolicyPage } from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${STORE_NAME} collects and uses personal data.`,
}

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy policy"
      eyebrow="YOUR PRIVACY"
      updated="28 October 2026"
    >
      <p>
        This notice explains how {STORE_NAME} collects and uses personal
        information when you visit our website, create an account, place an
        order, contact us or ask to receive marketing.
      </p>

      <section>
        <h2>Who we are</h2>
        <p>
          {STORE_NAME} is a floral and gift studio serving Walton-on-the-Naze,
          Clacton-on-Sea and surrounding areas. The business trading as{" "}
          {STORE_NAME} is the controller of the personal information described
          in this notice. For privacy questions or to exercise your rights,
          email{" "}
          <a href="mailto:info@shoreandgrace.com">info@shoreandgrace.com</a>.
        </p>
        <p className="sg-policy-callout">
          Before launch, the business owner must add the controller&apos;s full
          legal name and postal address here.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>
            Identity and contact details, including names, email addresses,
            telephone numbers and billing or delivery addresses.
          </li>
          <li>
            Order information, including products, recipients, delivery
            instructions, gift messages, discounts, returns and refunds.
          </li>
          <li>
            Account information, including saved addresses, wishlists, memorable
            occasions and shopping preferences.
          </li>
          <li>
            Payment and fraud-prevention information. Card details are entered
            into our payment provider&apos;s secure payment interface and are
            not stored by {STORE_NAME}.
          </li>
          <li>
            Communications, reviews and information you send through forms or
            customer support.
          </li>
          <li>
            Technical information such as IP address, browser, device, request
            time, security logs and cookie choices.
          </li>
        </ul>
        <p>
          Please do not include sensitive personal information in gift messages
          or delivery instructions.
        </p>
      </section>

      <section>
        <h2>Information about gift recipients</h2>
        <p>
          If someone orders a gift for you, we receive your name, delivery
          address and sometimes your telephone number from the purchaser. We use
          those details only to arrange and complete the requested delivery,
          handle delivery questions and meet legal obligations. We do not add a
          recipient to marketing lists because another person bought them a
          gift.
        </p>
      </section>

      <section>
        <h2>Why we use information</h2>
        <div className="sg-policy-table-wrap sg-policy-purpose-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Purpose</th>
                <th scope="col">Lawful basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Purpose">
                  Provide accounts, baskets, checkout, orders and delivery
                </td>
                <td data-label="Lawful basis">
                  Contract or steps requested before a contract
                </td>
              </tr>
              <tr>
                <td data-label="Purpose">
                  Payments, fraud prevention and website security
                </td>
                <td data-label="Lawful basis">
                  Contract and legitimate interests in secure trading
                </td>
              </tr>
              <tr>
                <td data-label="Purpose">
                  Tax, accounting and other required records
                </td>
                <td data-label="Lawful basis">Legal obligation</td>
              </tr>
              <tr>
                <td data-label="Purpose">
                  Customer support, service improvement and reviews
                </td>
                <td data-label="Lawful basis">
                  Contract and legitimate interests in running the business
                </td>
              </tr>
              <tr>
                <td data-label="Purpose">
                  Optional cookies and personalised browsing history
                </td>
                <td data-label="Lawful basis">Consent</td>
              </tr>
              <tr>
                <td data-label="Purpose">
                  Newsletters and promotional email
                </td>
                <td data-label="Lawful basis">
                  Consent, unless a lawful customer soft opt-in applies
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Who we share information with</h2>
        <p>
          We share only what is necessary with providers that help us host and
          secure the store, process payments, send service emails, arrange
          delivery, provide customer support or meet legal and accounting
          obligations. Payment information is processed by Stripe when Stripe is
          the selected payment provider. If analytics consent is enabled,
          PostHog processes anonymous pageview, device and limited shopping
          journey information for us. Analytics events use product identifiers,
          quantities, prices, currency, country code and checkout step only. We
          do not send purchaser or recipient names, contact details, addresses,
          delivery instructions or gift messages to PostHog. We do not sell
          personal information.
        </p>
        <p>
          Some providers may process information outside the UK. Where this
          happens, we require an approved transfer mechanism and appropriate
          safeguards. The final provider and international-transfer list will be
          published before production services are enabled.
        </p>
      </section>

      <section>
        <h2>How long we keep information</h2>
        <p>
          We keep personal information only for as long as needed for the
          purpose collected. Account data is kept while the account is active
          and then removed or anonymised after closure, subject to records we
          must retain. Order, payment, refund and accounting records are kept
          for the period required by tax and company law. Marketing information
          is used until consent is withdrawn, while a minimal suppression record
          may be retained to ensure we honour an opt-out. Security logs and
          backups are retained for limited operational periods and then deleted
          or overwritten.
        </p>
      </section>

      <section>
        <h2>Your choices and rights</h2>
        <p>
          Depending on the circumstances, you may ask us for access to,
          correction of, deletion of, restriction of or portability of your
          information. You may also object to processing and withdraw consent at
          any time. You can download account information and request account
          deletion from account settings, or contact us if you do not have an
          account.
        </p>
        <p>
          Marketing can be stopped using the unsubscribe link in a message or by
          contacting us. Optional cookies can be changed at any time using the
          Cookie settings control in the footer.
        </p>
        <p>
          If you are unhappy with our response, you can complain to the{" "}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            target="_blank"
            rel="noreferrer"
          >
            Information Commissioner&apos;s Office
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Our{" "}
          <LocalizedClientLink href="/cookies">
            Cookie policy
          </LocalizedClientLink>{" "}
          lists the cookies and browser storage currently used and explains how
          to change optional choices.
        </p>
      </section>

      <section>
        <h2>Changes to this notice</h2>
        <p>
          We review this notice when services, providers or legal requirements
          change. The date at the top shows the latest revision.
        </p>
      </section>
    </PolicyPage>
  )
}
