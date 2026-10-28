import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertDeliveryReservationStep,
  UpsertDeliveryReservationInput,
} from "./steps/upsert-delivery-reservation"

export const upsertDeliveryReservationWorkflow = createWorkflow(
  "upsert-delivery-reservation",
  (input: UpsertDeliveryReservationInput) => {
    const reservation = upsertDeliveryReservationStep(input)
    return new WorkflowResponse({ reservation })
  }
)
