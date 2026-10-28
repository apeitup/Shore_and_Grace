import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

export type CreateReviewStepInput = {
  content: string
  rating: number
  product_id: string
  customer_id?: string
  name: string
  email: string
  status?: "pending" | "approved" | "rejected"
}

export const createReviewStep = createStep(
  "create-review",
  async (input: CreateReviewStepInput, { container }) => {
    const reviewModuleService: ProductReviewModuleService = container.resolve(
      PRODUCT_REVIEW_MODULE
    )
    const review = await reviewModuleService.createReviews(input)

    return new StepResponse(review, review.id)
  },
  async (reviewId, { container }) => {
    if (!reviewId) {
      return
    }

    const reviewModuleService: ProductReviewModuleService = container.resolve(
      PRODUCT_REVIEW_MODULE
    )

    await reviewModuleService.deleteReviews(reviewId)
  }
)
