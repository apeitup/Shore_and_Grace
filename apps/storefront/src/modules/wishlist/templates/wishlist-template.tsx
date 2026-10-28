import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import ProductPreview from "@modules/products/components/product-preview"
import RelatedProductsCarousel from "@modules/products/components/related-products/carousel"
import WishlistItem from "@modules/wishlist/components/wishlist-item"

type WishlistTemplateProps = {
  products: HttpTypes.StoreProduct[]
  popularProducts: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

const WishlistTemplate = ({
  products,
  popularProducts,
  region,
}: WishlistTemplateProps) => (
  <>
    <section className="content-container sg-wishlist-content">
      {products.length ? (
        <>
          <p className="sg-wishlist-count">
            {products.length} saved {products.length === 1 ? "item" : "items"}
          </p>
          <div className="sg-wishlist-table" role="table" aria-label="Wishlist">
            <div className="sg-wishlist-table__header" role="row">
              <span role="columnheader">Image</span>
              <span role="columnheader">Product</span>
              <span role="columnheader">Price</span>
              <span role="columnheader">Quantity</span>
              <span role="columnheader">Add to cart</span>
              <span role="columnheader">Remove</span>
            </div>
            <div className="sg-wishlist-table__body" role="rowgroup">
              {products.map((product) => (
                <WishlistItem key={product.id} product={product} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="sg-wishlist-empty">
          <h2>Your wishlist is empty</h2>
          <p>Save your favourite flowers and gifts to find them here.</p>
        </div>
      )}
    </section>

    {!!popularProducts.length && (
      <section className="content-container sg-related-products sg-wishlist-popular">
        <div className="sg-related-products__heading">
          <Image
            src="/assets/home/sections/section-foliage.svg"
            alt=""
            width={159}
            height={63}
          />
          <h2>
            <span className="sg-related-products__desktop-title">
              Shop by Popular Occasions
            </span>
            <span className="sg-related-products__mobile-title">
              Popular products
            </span>
          </h2>
        </div>
        <RelatedProductsCarousel>
          {popularProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </RelatedProductsCarousel>
      </section>
    )}
  </>
)

export default WishlistTemplate
