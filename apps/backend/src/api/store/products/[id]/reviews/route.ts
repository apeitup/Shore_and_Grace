import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"

export const GetStoreReviewsSchema = createFindParams()

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const reviewModuleService: ProductReviewModuleService = req.scope.resolve(
    PRODUCT_REVIEW_MODULE
  )
  const {
    data: reviews,
    metadata: { count, take, skip } = { count: 0, take: 10, skip: 0 },
  } = await query.graph({
    entity: "review",
    filters: {
      product_id: req.params.id,
      status: "approved",
    },
    ...req.queryConfig,
  })

  res.json({
    reviews,
    count,
    limit: take,
    offset: skip,
    average_rating: await reviewModuleService.getAverageRating(req.params.id),
  })
}
