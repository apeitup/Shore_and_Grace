import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteCustomerOccasionStep,
  DeleteCustomerOccasionInput,
} from "./steps/delete-customer-occasion"

export const deleteCustomerOccasionWorkflow = createWorkflow(
  "delete-customer-occasion",
  function (input: DeleteCustomerOccasionInput) {
    const deletedId = deleteCustomerOccasionStep(input)
    return new WorkflowResponse({ deleted_id: deletedId })
  }
)
