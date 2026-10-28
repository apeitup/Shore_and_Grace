import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  saveDeliveryZoneStep,
  SaveDeliveryZoneInput,
} from "./steps/save-delivery-zone"

export const saveDeliveryZoneWorkflow = createWorkflow(
  "save-delivery-zone",
  (input: SaveDeliveryZoneInput) => {
    const zone = saveDeliveryZoneStep(input)
    return new WorkflowResponse({ zone })
  }
)
