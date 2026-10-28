"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import ProductReviews from "@modules/products/components/product-reviews"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState("Description")
  const tabs = [
    {
      label: "Description",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Reviews",
      component: <ProductReviews productId={product.id} />,
    },
    {
      label: "Shipping Policy",
      component: <ShippingInfoTab />,
    },
    {
      label: "Frequently asked questions",
      component: <FaqTab />,
    },
  ]

  return (
    <div className="w-full">
      <div className="sg-product-tabs__desktop">
        <div className="sg-product-tabs__list" role="tablist" aria-label="Product information">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.label}
              className={activeTab === tab.label ? "is-active" : ""}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="sg-product-tabs__panel" role="tabpanel">
          {tabs.find((tab) => tab.label === activeTab)?.component}
        </div>
      </div>
      <Accordion
        type="multiple"
        defaultValue={["Description"]}
        className="sg-product-tabs__mobile"
      >
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      {product.description && (
        <p className="mb-6 max-w-4xl whitespace-pre-line">{product.description}</p>
      )}
      <div className="sg-product-description__details grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const FaqTab = () => (
  <div className="text-small-regular py-8">
    <p>
      Need help choosing or caring for your flowers? Contact Shore &amp; Grace
      and we will be happy to help.
    </p>
  </div>
)

export default ProductTabs
