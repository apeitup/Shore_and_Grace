import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CUSTOMER_PREFERENCES_MODULE } from "../../../modules/customer-preferences"
import CustomerPreferencesModuleService from "../../../modules/customer-preferences/service"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"
import { SPECIAL_OCCASION_MODULE } from "../../../modules/special-occasion"
import SpecialOccasionModuleService from "../../../modules/special-occasion/service"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const customerId = req.auth_context.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const preferencesService: CustomerPreferencesModuleService =
    req.scope.resolve(CUSTOMER_PREFERENCES_MODULE)
  const wishlistService: WishlistModuleService = req.scope.resolve(
    WISHLIST_MODULE
  )
  const occasionService: SpecialOccasionModuleService = req.scope.resolve(
    SPECIAL_OCCASION_MODULE
  )
  const reviewService: ProductReviewModuleService = req.scope.resolve(
    PRODUCT_REVIEW_MODULE
  )

  const [customerResult, preferences, wishlist, occasions, reviews] =
    await Promise.all([
      query.graph({
        entity: "customer",
        fields: [
          "id",
          "email",
          "first_name",
          "last_name",
          "phone",
          "created_at",
          "updated_at",
          "metadata",
          "addresses.*",
          "orders.*",
          "orders.items.*",
          "orders.shipping_address.*",
          "orders.billing_address.*",
        ],
        filters: { id: customerId },
      }),
      preferencesService.listCustomerPreferences({ customer_id: customerId }),
      wishlistService.listWishlistItems({ customer_id: customerId }),
      occasionService.listCustomerOccasions({ customer_id: customerId }),
      reviewService.listReviews({ customer_id: customerId }),
    ])

  res.json({
    exported_at: new Date().toISOString(),
    customer: customerResult.data[0] ?? null,
    preferences: preferences[0] ?? null,
    wishlist,
    occasions,
    reviews,
  })
}
