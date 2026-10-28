import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRIVACY_REQUEST_MODULE } from "../../modules/privacy-request"
import PrivacyRequestModuleService from "../../modules/privacy-request/service"

export type PrivacyRequestStatus =
  | "received"
  | "identity_check"
  | "in_progress"
  | "completed"
  | "rejected"

export type PrivacyRequestIdentityStatus = "pending" | "verified" | "failed"

export type UpdatePrivacyRequestStepInput = {
  id: string
  status?: PrivacyRequestStatus
  identity_status?: PrivacyRequestIdentityStatus
  internal_notes?: string | null
}

export const updatePrivacyRequestStep = createStep(
  "update-privacy-request",
  async (input: UpdatePrivacyRequestStepInput, { container }) => {
    const service: PrivacyRequestModuleService = container.resolve(
      PRIVACY_REQUEST_MODULE
    )
    const original = await service.retrievePrivacyRequest(input.id)
    const nextStatus = input.status ?? original.status
    const request = await service.updatePrivacyRequests({
      ...input,
      completed_at:
        nextStatus === "completed"
          ? original.completed_at ?? new Date().toISOString()
          : null,
    })

    return new StepResponse(request, original)
  },
  async (original, { container }) => {
    if (!original) {
      return
    }
    const service: PrivacyRequestModuleService = container.resolve(
      PRIVACY_REQUEST_MODULE
    )
    await service.updatePrivacyRequests(original)
  }
)
