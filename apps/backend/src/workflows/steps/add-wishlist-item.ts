import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import WishlistModuleService from "../../modules/wishlist/service"

export type AddWishlistItemStepInput = {
  customer_id: string
  product_id: string
}

export const addWishlistItemStep = createStep(
  "add-wishlist-item",
  async (input: AddWishlistItemStepInput, { container }) => {
    const wishlistModuleService: WishlistModuleService = container.resolve(
      WISHLIST_MODULE
    )
    const [existingItem] = await wishlistModuleService.listWishlistItems(input)

    if (existingItem) {
      return new StepResponse(existingItem, {
        id: existingItem.id,
        created: false,
      })
    }

    const item = await wishlistModuleService.createWishlistItems(input)

    return new StepResponse(item, { id: item.id, created: true })
  },
  async (compensation, { container }) => {
    if (!compensation?.created) {
      return
    }

    const wishlistModuleService: WishlistModuleService = container.resolve(
      WISHLIST_MODULE
    )

    await wishlistModuleService.deleteWishlistItems(compensation.id)
  }
)
