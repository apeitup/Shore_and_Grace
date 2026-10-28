import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  removeWishlistItemStep,
  RemoveWishlistItemStepInput,
} from "./steps/remove-wishlist-item"

export const removeWishlistItemWorkflow = createWorkflow(
  "remove-wishlist-item",
  (input: RemoveWishlistItemStepInput) => {
    const removedItemIds = removeWishlistItemStep(input)

    return new WorkflowResponse({ removedItemIds })
  }
)
