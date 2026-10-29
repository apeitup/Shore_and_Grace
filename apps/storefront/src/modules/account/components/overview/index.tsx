import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CustomerOccasion, SystemOccasion } from "@lib/data/occasions"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[]
  occasions: CustomerOccasion[]
  systemOccasions: SystemOccasion[]
  wishlistProducts: HttpTypes.StoreProduct[]
  popularProducts: HttpTypes.StoreProduct[]
}

const formatDate = (date?: string | null) => {
  if (!date) return "Date not set"

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(new Date(date))
}

type OverviewOccasion = {
  id: string
  name: string
  date: string
  reminderDays: number
  repeatsAnnually: boolean
}

const nextOccurrenceTime = (occasion: OverviewOccasion) => {
  const date = new Date(`${occasion.date.slice(0, 10)}T12:00:00`)

  if (!occasion.repeatsAnnually) return date.getTime()

  const today = new Date()
  const nextOccurrence = new Date(
    today.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12
  )

  if (nextOccurrence < today) {
    nextOccurrence.setFullYear(today.getFullYear() + 1)
  }

  return nextOccurrence.getTime()
}

const ProductCard = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const price = getProductPrice({ product }).cheapestPrice

  return (
    <article className="sg-overview-product">
      <div className="sg-overview-product__image">
        {product.thumbnail ? (
          <Image src={product.thumbnail} alt="" fill sizes="120px" />
        ) : null}
      </div>
      <div className="sg-overview-product__details">
        <h3>{product.title}</h3>
        {price ? <p>From {price.calculated_price}</p> : null}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="sg-secondary-button sg-overview-product__button"
        >
          View
        </LocalizedClientLink>
      </div>
    </article>
  )
}

const Overview = ({
  customer,
  orders,
  occasions,
  systemOccasions,
  wishlistProducts,
  popularProducts,
}: OverviewProps) => {
  const links = [
    ["Orders", "Manage your recent orders.", "/account/orders"],
    ["Wishlist", "View and manage your saved flowers.", "/account/wishlist"],
    ["Addresses", "Manage your account addresses.", "/account/addresses"],
    ["Dates & occasions", "Manage your meaningful dates.", "/account/occasions"],
    ["Account details", "Manage your personal information.", "/account/profile"],
    ["Notifications", "Choose which updates you receive and how.", "/account/notifications"],
    ["Settings", "Manage your preferences, privacy and account.", "/account/settings"],
  ]

  const latestOrder = orders[0]
  const latestItem = latestOrder?.items?.[0]
  const isNewCustomer = !latestOrder
  const status = latestOrder?.fulfillment_status || latestOrder?.status || "pending"
  const statusLabel = status.includes("delivered")
    ? "Delivered"
    : status.includes("shipped")
      ? "On its way"
      : status === "canceled"
        ? "Cancelled"
        : "Preparing your order"
  const progressStep = status.includes("delivered")
    ? 4
    : status.includes("shipped")
      ? 3
      : latestOrder
        ? 2
        : 1
  const displayProducts = isNewCustomer ? popularProducts : wishlistProducts
  const upcomingOccasions: OverviewOccasion[] = [
    ...occasions
      .filter((occasion) => occasion.enabled && occasion.occasion_date)
      .map((occasion) => ({
        id: occasion.id,
        name: occasion.name,
        date: occasion.occasion_date as string,
        reminderDays: occasion.reminder_days,
        repeatsAnnually: occasion.repeats_annually,
      })),
    ...systemOccasions
      .filter((occasion) => occasion.enabled && occasion.next_date)
      .map((occasion) => ({
        id: occasion.id,
        name: occasion.name,
        date: occasion.next_date,
        reminderDays: occasion.reminder_days,
        repeatsAnnually: true,
      })),
  ].sort((first, second) => nextOccurrenceTime(first) - nextOccurrenceTime(second))

  return (
    <div className="sg-account-overview" data-testid="overview-page-wrapper">
      <div className="sg-account-overview__mobile">
        <h1>Welcome back, {customer?.first_name || "there"}</h1>
        <p>Where would you like to start?</p>
        <ul>
          {links.map(([label, description, href]) => (
            <li key={href}>
              <LocalizedClientLink href={href}>
                <strong>{label}</strong>
                <span>{description}</span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="sg-account-overview__desktop">
        <header className="sg-account-overview__heading">
          <h1>
            {isNewCustomer
              ? "Welcome to Shore & Grace"
              : `Welcome back, ${customer?.first_name || "there"}`}
          </h1>
          <p>
            {isNewCustomer
              ? "A calm place to begin, with thoughtful prompts when you need them."
              : "Your next delivery, reminders and favourites at a glance."}
          </p>
        </header>

        {isNewCustomer ? (
          <>
            <section className="sg-overview-welcome-card">
              <div>
                <span>Welcome to Shore & Grace</span>
                <h2>Make someone&apos;s day beautifully simple</h2>
                <p>
                  Explore flowers and thoughtful gifts for birthdays, thank-yous,
                  celebrations, or simply because.
                </p>
                <LocalizedClientLink href="/store" className="sg-brand-button">
                  Shop our collection
                </LocalizedClientLink>
              </div>
              {popularProducts[0]?.thumbnail ? (
                <div className="sg-overview-welcome-card__image">
                  <Image
                    src={popularProducts[0].thumbnail}
                    alt=""
                    fill
                    sizes="190px"
                  />
                </div>
              ) : null}
            </section>

            <div className="sg-overview-prompt-grid">
              <section>
                <h2>Never miss a meaningful date</h2>
                <p>
                  Save birthdays and anniversaries. We will send a gentle reminder
                  when the time is right.
                </p>
                <LocalizedClientLink href="/account/occasions" className="sg-secondary-button">
                  Add a date
                </LocalizedClientLink>
              </section>
              <section>
                <h2>Keep inspiration close</h2>
                <p>Save flowers and gifts while you browse, ready for the perfect occasion.</p>
                <LocalizedClientLink href="/store" className="sg-secondary-button">
                  Explore products
                </LocalizedClientLink>
              </section>
            </div>
          </>
        ) : (
          <>
            <section className="sg-overview-delivery">
              <div className="sg-overview-delivery__topline">
                <div>
                  <h2>Your next delivery</h2>
                  <span>{statusLabel}</span>
                </div>
                <LocalizedClientLink
                  href={`/account/orders/details/${latestOrder.id}`}
                  className="sg-brand-button"
                >
                  Track order
                </LocalizedClientLink>
              </div>
              <div className="sg-overview-delivery__content">
                <div className="sg-overview-delivery__product">
                  <div className="sg-overview-delivery__image">
                    {latestItem?.thumbnail ? (
                      <Image src={latestItem.thumbnail} alt="" fill sizes="88px" />
                    ) : null}
                  </div>
                  <div>
                    <h3>{latestItem?.title || "Your Shore & Grace order"}</h3>
                    <p>
                      {latestOrder.shipping_address?.first_name
                        ? `For ${latestOrder.shipping_address.first_name} · `
                        : ""}
                      Order #SG-{latestOrder.display_id}
                    </p>
                    <strong>
                      Ordered {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "long",
                      }).format(new Date(latestOrder.created_at))}
                    </strong>
                  </div>
                </div>
                <ol className="sg-overview-progress" aria-label="Order progress">
                  {["Confirmed", "Prepared", "On its way", "Delivered"].map(
                    (label, index) => (
                      <li className={index < progressStep ? "is-complete" : ""} key={label}>
                        <span aria-hidden="true" />
                        <small>{label}</small>
                      </li>
                    )
                  )}
                </ol>
              </div>
            </section>

            <div className="sg-overview-returning-grid">
              <section className="sg-overview-occasions">
                <div className="sg-overview-section-heading">
                  <div>
                    <h2>Upcoming occasions</h2>
                    <p>Gentle reminders for dates that matter.</p>
                  </div>
                  <LocalizedClientLink href="/account/occasions">View dates</LocalizedClientLink>
                </div>
                {upcomingOccasions.length ? (
                  <ul>
                    {upcomingOccasions.slice(0, 2).map((occasion) => (
                      <li key={occasion.id}>
                        <strong>{occasion.name}</strong>
                        <span>
                          {formatDate(occasion.date)} · Reminder: {occasion.reminderDays} days before
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="sg-overview-occasions__empty">No dates saved yet.</p>
                )}
              </section>
              <section className="sg-overview-reorder">
                <span>A thoughtful shortcut</span>
                <h2>Send their favourite again</h2>
                <p>Repeat a previous bouquet, then change the message or delivery date.</p>
                <div>
                  {latestItem?.product?.handle ? (
                    <LocalizedClientLink
                      href={`/products/${latestItem.product.handle}`}
                      className="sg-brand-button"
                    >
                      Send again
                    </LocalizedClientLink>
                  ) : null}
                  <LocalizedClientLink href="/account/orders" className="sg-secondary-button">
                    View orders
                  </LocalizedClientLink>
                </div>
              </section>
            </div>
          </>
        )}

        <section className="sg-overview-products">
          <div className="sg-overview-section-heading">
            <div>
              <h2>{isNewCustomer ? "Popular right now" : "Saved for later"}</h2>
              {isNewCustomer ? <p>A little inspiration to get you started.</p> : null}
            </div>
            {!isNewCustomer ? (
              <LocalizedClientLink href="/account/wishlist">View wishlist</LocalizedClientLink>
            ) : null}
          </div>
          {displayProducts.length ? (
            <div className="sg-overview-products__grid">
              {displayProducts.slice(0, 2).map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          ) : (
            <p className="sg-overview-products__empty">
              {isNewCustomer
                ? "Products will appear here as the collection grows."
                : "Your saved products will appear here."}
            </p>
          )}
        </section>
      </div>

    </div>
  )
}

export default Overview
