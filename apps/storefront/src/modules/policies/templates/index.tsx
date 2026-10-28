import { convertToLocale } from "@lib/util/money"
import { formatDayRange, StorePolicies } from "@lib/util/store-policies"

export const formatShippingRate = (rate: number, currencyCode: string) =>
  rate === 0
    ? "Free"
    : convertToLocale({ amount: rate, currency_code: currencyCode })

export const PolicyPage = ({
  title,
  eyebrow,
  updated,
  children,
}: {
  title: string
  eyebrow?: string
  updated?: string
  children: React.ReactNode
}) => (
  <article
    className="content-container sg-policy-page"
    data-testid="policy-page"
  >
    {eyebrow && <p className="sg-policy-page__eyebrow">{eyebrow}</p>}
    <h1>{title}</h1>
    {updated && (
      <p className="sg-policy-page__updated">Last updated {updated}</p>
    )}
    <div className="sg-policy-page__content">{children}</div>
  </article>
)

export const PoliciesUnavailable = () => (
  <p className="text-ui-fg-subtle">
    Policy details for this region haven&apos;t been published yet.
  </p>
)

export const ShippingSummary = ({
  policies,
  currencyCode,
}: {
  policies: StorePolicies
  currencyCode: string
}) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
    <dt className="text-ui-fg-subtle">Shipping rate</dt>
    <dd>{formatShippingRate(policies.shippingRate, currencyCode)}</dd>
    <dt className="text-ui-fg-subtle">Processing time</dt>
    <dd>{formatDayRange(policies.handlingDays)} business days</dd>
    <dt className="text-ui-fg-subtle">Delivery time</dt>
    <dd>{formatDayRange(policies.transitDays)} business days after dispatch</dd>
  </dl>
)

export const PlaceholderNotice = () => (
  <p className="text-ui-fg-subtle" data-testid="policy-placeholder">
    This is placeholder content from the Medusa starter. Replace it with your
    store&apos;s own text before launch.
  </p>
)
