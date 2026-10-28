import { deleteCustomersWorkflow } from "@medusajs/medusa/core-flows"
import { CUSTOMER_PREFERENCES_MODULE } from "../../modules/customer-preferences"
import CustomerPreferencesModuleService from "../../modules/customer-preferences/service"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"
import { SPECIAL_OCCASION_MODULE } from "../../modules/special-occasion"
import SpecialOccasionModuleService from "../../modules/special-occasion/service"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import WishlistModuleService from "../../modules/wishlist/service"

deleteCustomersWorkflow.hooks.customersDeleted(
  async ({ ids }, { container }) => {
    const preferences: CustomerPreferencesModuleService = container.resolve(
      CUSTOMER_PREFERENCES_MODULE
    )
    const wishlist: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    const occasions: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    const reviews: ProductReviewModuleService = container.resolve(
      PRODUCT_REVIEW_MODULE
    )

    await Promise.all([
      preferences.deleteCustomerPreferences({ customer_id: ids }),
      wishlist.deleteWishlistItems({ customer_id: ids }),
      occasions.deleteCustomerOccasions({ customer_id: ids }),
      reviews.updateReviews({
        selector: { customer_id: ids },
        data: {
          customer_id: null,
          name: "Former customer",
          email: "removed-account@shoreandgrace.co.uk",
        },
      }),
    ])
  }
)
