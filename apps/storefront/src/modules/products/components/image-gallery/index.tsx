"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useEffect, useState } from "react"
import SaleBanner from "../sale-banner"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  onSale?: boolean
}

const ImageGallery = ({ images, onSale = false }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
      if (event.key === "ArrowRight")
        setActiveIndex((i) => (i + 1) % images.length)
      if (event.key === "ArrowLeft")
        setActiveIndex((i) => (i - 1 + images.length) % images.length)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isOpen, images.length])

  if (!images.length) return null
  const safeIndex = Math.min(activeIndex, images.length - 1)
  const active = images[safeIndex]
  const changeSlide = (direction: number) =>
    setActiveIndex((i) => (i + direction + images.length) % images.length)

  return (
    <div className="sg-product-gallery">
      <button
        type="button"
        className="sg-product-gallery__main"
        onClick={() => setIsOpen(true)}
        aria-label={`Open image ${safeIndex + 1} of ${
          images.length
        } in slideshow`}
      >
        {active.url && (
          <Image
            src={active.url}
            priority
            alt={`Product image ${safeIndex + 1}`}
            fill
            sizes="(max-width: 767px) calc(100vw - 32px), 500px"
          />
        )}
        {onSale && <SaleBanner variant="gallery" />}
        <span className="sg-product-gallery__zoom">View slideshow</span>
      </button>
      <div className="sg-product-gallery__thumbs" aria-label="Product images">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.id}
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show product image ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
          >
            {image.url && <Image src={image.url} alt="" fill sizes="90px" />}
          </button>
        ))}
      </div>
      {isOpen && (
        <div
          className="sg-product-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Product image slideshow"
        >
          <button
            className="sg-product-lightbox__close"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close slideshow"
          >
            ×
          </button>
          {images.length > 1 && (
            <button
              className="sg-product-lightbox__previous"
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          <div className="sg-product-lightbox__image">
            {active.url && (
              <Image
                src={active.url}
                alt={`Product image ${safeIndex + 1}`}
                fill
                sizes="90vw"
              />
            )}
          </div>
          {images.length > 1 && (
            <button
              className="sg-product-lightbox__next"
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Next image"
            >
              ›
            </button>
          )}
          <p>
            {safeIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageGallery
