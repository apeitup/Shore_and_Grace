import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import Image from "next/image"
import RelatedProductsCarousel from "./carousel"
import { retrieveCustomerPreferences } from "@lib/data/customer-preferences"
import { listMerchandisingProducts } from "@lib/data/merchandising"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const preferences = await retrieveCustomerPreferences()

  const [complementary, upsells, frequentlyBoughtTogether] = await Promise.all([
    listMerchandisingProducts({
      countryCode,
      kind: "complementary",
      sourceProductId: product.id,
    }),
    listMerchandisingProducts({
      countryCode,
      kind: "upsell",
      sourceProductId: product.id,
    }),
    listMerchandisingProducts({
      countryCode,
      kind: "frequently_bought_together",
      sourceProductId: product.id,
    }),
  ])

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (preferences.personalised_recommendations && product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (preferences.personalised_recommendations && product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  let products = complementary.products

  if (!products.length) {
    products = await listProducts({
      queryParams,
      countryCode,
    }).then(({ response }) => {
      return response.products.filter(
        (responseProduct) => responseProduct.id !== product.id
      )
    })
  }

  if (!complementary.products.length && products.length < 4) {
    const fallbackProducts = await listProducts({
      queryParams: {
        region_id: region.id,
        is_giftcard: false,
      },
      countryCode,
    }).then(({ response }) =>
      response.products.filter(
        (responseProduct) => responseProduct.id !== product.id
      )
    )

    const existingIds = new Set(products.map((relatedProduct) => relatedProduct.id))
    products = [
      ...products,
      ...fallbackProducts.filter(
        (fallbackProduct) => !existingIds.has(fallbackProduct.id)
      ),
    ].slice(0, 4)
  }

  if (!complementary.products.length && products.length < 4) {
    products = [product, ...products].slice(0, 4)
  }

  if (!products.length) {
    return null
  }

  const sections = [
    {
      key: "complementary",
      title: complementary.set?.name || "You may also like",
      products,
    },
    {
      key: "upsells",
      title: upsells.set?.name || "A little more special",
      products: upsells.products,
    },
    {
      key: "frequently-bought-together",
      title: frequentlyBoughtTogether.set?.name || "Frequently bought together",
      products: frequentlyBoughtTogether.products,
    },
  ].filter((section) => section.products.length)

  return sections.map((section) => (
    <div
      className="product-page-constraint sg-related-products__inner"
      key={section.key}
    >
      <div className="sg-related-products__heading">
        <Image
          src="/assets/home/sections/section-foliage.svg"
          alt=""
          width={159}
          height={63}
        />
        <h2>{section.title}</h2>
      </div>

      <RelatedProductsCarousel>
        {section.products.map((relatedProduct) => (
          <li key={relatedProduct.id}>
            <Product region={region} product={relatedProduct} />
          </li>
        ))}
      </RelatedProductsCarousel>
    </div>
  ))
}
