import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="sg-product-info">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="sg-product-info__eyebrow"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h1"
          className="sg-product-info__title"
          data-testid="product-title"
        >
          {product.title}
        </Heading>
      </div>
    </div>
  )
}

export default ProductInfo
