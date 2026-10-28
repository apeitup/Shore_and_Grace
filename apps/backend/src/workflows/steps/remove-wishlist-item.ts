import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import WishlistModuleService from "../../modules/wishlist/service"

export type RemoveWishlistItemStepInput = {
  customer_id: string
  product_id: string
}

export const removeWishlistItemStep = createStep(
  "remove-wishlist-item",
  async (input: RemoveWishlistItemStepInput, { container }) => {
    const wishlistModuleService: WishlistModuleService = container.resolve(
      WISHLIST_MODULE
    )
    const items = await wishlistModuleService.listWishlistItems(input)

    if (!items.length) {
      return new StepResponse([], [])
    }

    await wishlistModuleService.deleteWishlistItems(
      items.map((item) => item.id)
    )

    return new StepResponse(
      items.map((item) => item.id),
      items
    )
  },
  async (items, { container }) => {
    if (!items?.length) {
      return
    }

    const wishlistModuleService: WishlistModuleService = container.resolve(
      WISHLIST_MODULE
    )

    await wishlistModuleService.restoreWishlistItems(
      items.map((item) => item.id)
    )
  }
)
