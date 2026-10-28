import Image from "next/image"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import RelatedProductsCarousel from "@modules/products/components/related-products/carousel"

const CartRelatedProducts = async ({ countryCode }: { countryCode: string }) => {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const products = await listProducts({
    countryCode,
    queryParams: { limit: 4, is_giftcard: false },
  }).then(({ response }) => response.products)

  if (!products.length) {
    return null
  }

  return (
    <section className="content-container sg-cart-related">
      <div className="sg-related-products__heading">
        <Image
          src="/assets/home/sections/section-foliage.svg"
          alt=""
          width={118}
          height={47}
        />
        <h2>
          <span className="sg-related-products__desktop-title">Shop by Popular Occasions</span>
          <span className="sg-related-products__mobile-title">You may also like</span>
        </h2>
      </div>
      <RelatedProductsCarousel>
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </RelatedProductsCarousel>
    </section>
  )
}

export default CartRelatedProducts
