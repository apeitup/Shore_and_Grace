import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  emitEventStep,
  removeCustomerAccountWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"

type RemoveCustomerAccountInput = {
  customerId: string
}

export const removeCustomerAccountWithEmailWorkflow = createWorkflow(
  "remove-customer-account-with-email",
  (input: RemoveCustomerAccountInput) => {
    const { data: customer } = useQueryGraphStep({
      entity: "customer",
      fields: ["id", "email", "first_name"],
      filters: { id: input.customerId },
      options: { isList: false },
    }).config({ name: "get-customer-before-account-deletion" })

    const deletedCustomerId = removeCustomerAccountWorkflow.runAsStep({
      input: { customerId: input.customerId },
    })
    const eventData = transform(
      { customer, deletedCustomerId },
      ({ customer, deletedCustomerId }) => ({
        id: deletedCustomerId,
        email: customer.email,
        first_name: customer.first_name,
      }),
    )

    emitEventStep({
      eventName: "customer.account_deleted",
      data: eventData,
    })

    return new WorkflowResponse(deletedCustomerId)
  },
)
