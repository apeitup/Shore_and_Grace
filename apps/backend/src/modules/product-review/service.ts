import { MedusaService } from "@medusajs/framework/utils"
import Review from "./models/review"

class ProductReviewModuleService extends MedusaService({
  Review,
}) {
  async getAverageRating(productId: string): Promise<number> {
    const reviews = await this.listReviews({
      product_id: productId,
      status: "approved",
    })

    if (!reviews.length) {
      return 0
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0)

    return Number((total / reviews.length).toFixed(2))
  }
}

export default ProductReviewModuleService
