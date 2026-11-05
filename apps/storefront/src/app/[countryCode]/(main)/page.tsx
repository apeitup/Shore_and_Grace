import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import HomeSections from "@modules/home/components/home-sections"
import EditorialMotion from "@modules/common/components/editorial-motion"
import { listHomepageCategories } from "@lib/data/categories"
import { listMerchandisingProducts } from "@lib/data/merchandising"
import { getRegion, listRegions } from "@lib/data/regions"
import { toJsonLd } from "@lib/util/product-structured-data"
import { getSiteOrigin, STORE_NAME } from "@lib/util/site"
import { buildRegionsReturnPolicies } from "@lib/util/store-policies"
import { resolveMediaUrl } from "@lib/util/resolve-media-url"

export const dynamic = "force-static"
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getSiteOrigin()

  return {
    title: "Shore & Grace | Flowers, botanicals and thoughtful gifts",
    description:
      "Fresh flowers, lasting botanicals and thoughtful gifts, arranged with care on the Essex coast.",
    alternates: {
      canonical: origin,
      languages: {
        "en-GB": origin,
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

  const [origin, regions, categories, homepageGifts] = await Promise.all([
    getSiteOrigin(),
    listRegions(),
    listHomepageCategories(),
    listMerchandisingProducts({
      countryCode,
      handle: "homepage-gifts",
      includeGiftCards: true,
    }).catch(() => ({ set: null, products: [] })),
  ])
  const homeOccasions = categories
    .map((category) => {
      const metadata =
        category.metadata && typeof category.metadata === "object"
          ? (category.metadata as Record<string, unknown>)
          : {}
      const placement =
        metadata.homepage_popular &&
        typeof metadata.homepage_popular === "object" &&
        !Array.isArray(metadata.homepage_popular)
          ? (metadata.homepage_popular as Record<string, unknown>)
          : {}
      const media =
        metadata.category_media &&
        typeof metadata.category_media === "object" &&
        !Array.isArray(metadata.category_media)
          ? (metadata.category_media as Record<string, unknown>)
          : {}

      return {
        enabled: placement.enabled === true,
        position:
          typeof placement.position === "number" ? placement.position : 999,
        title:
          typeof placement.display_title === "string" && placement.display_title
            ? placement.display_title
            : category.name,
        slug: category.handle,
        sectionTitle:
          typeof placement.section_title === "string" && placement.section_title
            ? placement.section_title
            : "Shop by Popular Occasions",
        imageUrl:
          typeof media.card_image_url === "string"
            ? resolveMediaUrl(media.card_image_url)
            : "",
        fallbackImage: [
          "christmas",
          "birthday",
          "autumn",
          "anniversary",
        ].includes(category.handle)
          ? `occasion-${category.handle}`
          : "",
        altText:
          typeof media.alt_text === "string" && media.alt_text
            ? media.alt_text
            : `${category.name} flowers`,
      }
    })
    .filter((occasion) => occasion.enabled)
    .sort((a, b) => a.position - b.position)
    .slice(0, 4)
  const homeUrl = origin
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
      <main data-sg-motion-root="home">
        <EditorialMotion />
        <Hero />
        <HomeSections
          occasions={homeOccasions}
          gifts={homepageGifts.products.slice(0, 3)}
          occasionSectionTitle={homeOccasions[0]?.sectionTitle}
          giftSectionTitle={homepageGifts.set?.name}
        />
      </main>
    </>
  )
}
