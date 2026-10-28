import React, { Suspense } from "react"

import ShopPageHero from "@modules/brand/components/shop-page-hero"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import VariantImageGallery from "@modules/products/components/image-gallery/variant-image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { notFound } from "next/navigation"
import RecentProductTracker from "@modules/products/components/recent-product-tracker"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="sg-product-page">
      <RecentProductTracker productId={product.id} />
      <ShopPageHero
        title="Product Details"
        trail={[
          { label: "Shop", href: "/store" },
          { label: product.title || "Product" },
        ]}
      />
      <div className="content-container sg-product-back-row">
        <LocalizedClientLink href="/store" className="sg-product-back">
          <Image
            src="/assets/shop/product-back.svg"
            alt=""
            width={18}
            height={18}
          />
          <span>Back</span>
        </LocalizedClientLink>
      </div>
      <div className="content-container sg-product-layout" data-testid="product-container">
        <div className="sg-product-layout__gallery">
          <LocalizedClientLink href="/store" className="sg-product-back sg-product-back--mobile">
            <Image
              src="/assets/shop/product-back.svg"
              alt=""
              width={18}
              height={18}
            />
            <span>Back</span>
          </LocalizedClientLink>
          <VariantImageGallery product={product} />
        </div>
        <div className="sg-product-layout__purchase">
          <ProductInfo product={product} />
          <ProductOnboardingCta />
          <ProductActions product={product} region={region} />
        </div>
        <div className="sg-product-layout__tabs">
          <ProductTabs product={product} />
        </div>
      </div>
      <div
        className="content-container sg-related-products"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
