import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import PreviewPrice from "./price"
import ProductGridCard from "../product-grid-card"

export default async function ProductPreview({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <ProductGridCard
      productId={product.id}
      title={product.title}
      handle={product.handle}
      thumbnail={product.thumbnail}
      price={cheapestPrice ? <PreviewPrice price={cheapestPrice} /> : null}
      onSale={cheapestPrice?.price_type === "sale"}
      regionId={region.id}
      initialProduct={product}
    />
  )
}
