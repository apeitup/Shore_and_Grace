import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import Image from "next/image"
import RelatedProductsCarousel from "./carousel"
import { retrieveCustomerPreferences } from "@lib/data/customer-preferences"

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

  let products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (products.length < 4) {
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

  if (products.length < 4) {
    products = [product, ...products].slice(0, 4)
  }

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint sg-related-products__inner">
      <div className="sg-related-products__heading">
        <Image
          src="/assets/home/sections/section-foliage.svg"
          alt=""
          width={159}
          height={63}
        />
        <h2>You may also like</h2>
      </div>

      <RelatedProductsCarousel>
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </RelatedProductsCarousel>
    </div>
  )
}
