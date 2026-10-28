"use client"

import { useEffect, useRef } from "react"

const bannerBackgrounds = [
  {
    desktop: "/assets/shop/banner-tulips-desktop.png",
    mobile: "/assets/shop/banner-tulips-mobile.png",
  },
  {
    desktop: "/assets/shop/banner-roses-peonies.jpg",
    mobile: "/assets/shop/banner-roses-peonies.jpg",
  },
  {
    desktop: "/assets/shop/banner-daisies-cornflowers.jpg",
    mobile: "/assets/shop/banner-daisies-cornflowers.jpg",
  },
  {
    desktop: "/assets/shop/banner-orchids-calla-lilies.jpg",
    mobile: "/assets/shop/banner-orchids-calla-lilies.jpg",
  },
  {
    desktop: "/assets/shop/banner-poppies-chamomile.jpg",
    mobile: "/assets/shop/banner-poppies-chamomile.jpg",
  },
  {
    desktop: "/assets/shop/banner-dahlias-hydrangeas.jpg",
    mobile: "/assets/shop/banner-dahlias-hydrangeas.jpg",
  },
]

const ShopBannerBackground = () => {
  const mobileSourceRef = useRef<HTMLSourceElement>(null)
  const desktopImageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const randomValue = crypto.getRandomValues(new Uint32Array(1))[0]
    const background = bannerBackgrounds[randomValue % bannerBackgrounds.length]

    if (mobileSourceRef.current) {
      mobileSourceRef.current.srcset = background.mobile
    }

    if (desktopImageRef.current) {
      desktopImageRef.current.src = background.desktop
    }
  }, [])

  return (
    <div className="sg-shop-hero__background" aria-hidden="true">
      <picture>
        <source
          ref={mobileSourceRef}
          media="(max-width: 767px)"
        />
        <img ref={desktopImageRef} alt="" />
      </picture>
    </div>
  )
}

export default ShopBannerBackground
