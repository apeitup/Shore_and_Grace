import type { ICustomerModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  updateCartWorkflow,
  updateCustomersWorkflow,
} from "@medusajs/medusa/core-flows"
import { getGuestPurchaserUpdate } from "../../utils/checkout-purchaser"

updateCartWorkflow.hooks.cartUpdated(
  async ({ cart, additional_data }, { container }) => {
    const customerId = cart?.customer_id ?? cart?.customer?.id

    if (!customerId) {
      return
    }

    const customerModule: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER
    )
    const customer = await customerModule.retrieveCustomer(customerId)
    const update = getGuestPurchaserUpdate(customer, additional_data)

    if (!update) {
      return
    }

    await updateCustomersWorkflow(container).run({
      input: {
        selector: { id: [customerId] },
        update,
      },
    })
  }
)
