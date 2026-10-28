"use client"

import BrandButton from "@modules/brand/components/button"
import { addProductReview, getProductReviews } from "@lib/data/products"
import Image from "next/image"
import { FormEvent, useEffect, useState } from "react"
import { StoreProductReview } from "types/global"

type ProductReviewsProps = {
  productId: string
}

const StarRating = ({
  rating,
  interactive = false,
  onChange,
}: {
  rating: number
  interactive?: boolean
  onChange?: (rating: number) => void
}) => (
  <div className="sg-review-stars" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => {
      const value = index + 1
      const star = (
        <Image
          src={
            value <= rating
              ? "/assets/shop/review-star-filled.svg"
              : "/assets/shop/review-star-outline.svg"
          }
          alt=""
          width={18}
          height={18}
        />
      )

      return interactive ? (
        <button
          key={value}
          type="button"
          aria-label={`${value} star${value === 1 ? "" : "s"}`}
          aria-pressed={value === rating}
          onClick={() => onChange?.(value)}
        >
          {star}
        </button>
      ) : (
        <span key={value}>{star}</span>
      )
    })}
  </div>
)

const ReviewCard = ({ review }: { review: StoreProductReview }) => {
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(review.created_at))

  return (
    <article className="sg-product-review-card">
      <StarRating rating={review.rating} />
      <p className="sg-product-review-card__meta">
        <strong>{review.name}</strong>
        <span> - {date}</span>
      </p>
      <p>{review.content}</p>
    </article>
  )
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<StoreProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    getProductReviews({ productId })
      .then((result) => {
        if (active) {
          setReviews(result.reviews)
        }
      })
      .catch(() => {
        if (active) {
          setError("Reviews could not be loaded at the moment.")
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [productId])

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!rating) {
      setError("Please select a star rating.")
      return
    }

    setSubmitting(true)

    try {
      await addProductReview({
        product_id: productId,
        rating,
        name,
        email,
        content,
      })
      setRating(0)
      setName("")
      setEmail("")
      setContent("")
      setMessage("Thank you. Your review is awaiting approval.")
    } catch {
      setError("We could not submit your review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sg-product-reviews">
      <div className="sg-product-reviews__list" aria-live="polite">
        {loading && <p>Loading reviews…</p>}
        {!loading && !error && reviews.length === 0 && (
          <p>No reviews have been added for this product yet.</p>
        )}
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <section className="sg-product-review-form-section">
        <h3>Add a review</h3>
        <p>Your email address will not be published. Required fields are marked *</p>

        <form className="sg-product-review-form" onSubmit={submitReview}>
          <fieldset>
            <legend>Your Rating *</legend>
            <StarRating rating={rating} interactive onChange={setRating} />
          </fieldset>

          <div className="sg-product-review-form__fields">
            <label>
              <span>Name *</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                maxLength={120}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              <span>Email *</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                maxLength={320}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Comment *</span>
            <textarea
              name="comment"
              maxLength={4000}
              required
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>

          {message && <p className="sg-product-review-form__success">{message}</p>}
          {error && <p className="sg-product-review-form__error">{error}</p>}

          <BrandButton
            type="submit"
            variant="secondary"
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit"}
          </BrandButton>
        </form>
      </section>
    </div>
  )
}
