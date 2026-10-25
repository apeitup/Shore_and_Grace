import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import { getRegion, listRegions } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { toJsonLd } from "@lib/util/product-structured-data"
import { getSiteOrigin, listCountryCodes, STORE_NAME } from "@lib/util/site"
import { buildRegionsReturnPolicies } from "@lib/util/store-policies"

export const dynamic = "force-static"
export const revalidate = 60

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const [origin, regions] = await Promise.all([getSiteOrigin(), listRegions()])

  return {
    title: "Shore & Grace | Flowers, botanicals and thoughtful gifts",
    description:
      "Fresh flowers, lasting botanicals and thoughtful gifts, arranged with care on the Essex coast.",
    alternates: {
      canonical: `${origin}/${countryCode}`,
      languages: {
        ...Object.fromEntries(
          listCountryCodes(regions).map((code) => [
            `en-${code.toUpperCase()}`,
            `${origin}/${code}`,
          ]),
        ),
        "x-default": origin,
      },
    },
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const [origin, regions] = await Promise.all([getSiteOrigin(), listRegions()])
  const homeUrl = `${origin}/${countryCode}`
  const returnPolicies = buildRegionsReturnPolicies(regions)
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: STORE_NAME,
      url: origin,
      ...(returnPolicies.length
        ? { hasMerchantReturnPolicy: returnPolicies }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: STORE_NAME,
      url: homeUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${homeUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(structuredData) }}
      />
      <Hero />
      <section className="sg-services" aria-labelledby="services-heading">
        <div className="content-container">
          <div className="sg-section-heading">
            <p className="sg-kicker">Made for the moment</p>
            <h2 id="services-heading">Flowers with feeling</h2>
            <p>
              From an everyday gesture to a final tribute, each piece is made
              with a quiet eye for colour, texture and meaning.
            </p>
          </div>
          <div className="sg-service-grid">
            <LocalizedClientLink
              href="/store"
              className="sg-service-card sg-service-card--fresh"
            >
              <span>01</span>
              <div>
                <p>Seasonal & expressive</p>
                <h3>Fresh flowers</h3>
              </div>
              <strong>Explore</strong>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="sg-service-card sg-service-card--lasting"
            >
              <span>02</span>
              <div>
                <p>Beautiful beyond the season</p>
                <h3>Faux botanicals</h3>
              </div>
              <strong>Explore</strong>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/contact"
              className="sg-service-card sg-service-card--tribute"
            >
              <span>03</span>
              <div>
                <p>Personal & considered</p>
                <h3>Funeral tributes</h3>
              </div>
              <strong>Enquire</strong>
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section className="sg-story">
        <div className="content-container sg-story__inner">
          <div className="sg-story__botanical" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="sg-story__copy">
            <p className="sg-kicker">From the Essex coast</p>
            <h2>Thoughtfully gathered. Gracefully given.</h2>
            <p>
              Shore & Grace is a floral and gift studio rooted in
              Walton-on-the-Naze. We create pieces that feel personal, unhurried
              and made to be remembered.
            </p>
            <LocalizedClientLink href="/contact" className="sg-text-link">
              Meet Shore & Grace <span aria-hidden="true">→</span>
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </>
  )
}
