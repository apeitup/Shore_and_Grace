import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRIVACY_REQUEST_MODULE } from "../../modules/privacy-request"
import PrivacyRequestModuleService from "../../modules/privacy-request/service"
import {
  addCalendarMonth,
  createPrivacyRequestReference,
} from "../../utils/privacy-request"

export type PrivacyRequestType =
  | "access"
  | "correction"
  | "deletion"
  | "restriction"
  | "objection"
  | "portability"

export type PrivacyRequesterType = "customer" | "gift_recipient" | "visitor"

export type CreatePrivacyRequestStepInput = {
  request_type: PrivacyRequestType
  requester_type: PrivacyRequesterType
  name: string
  email: string
  phone?: string | null
  order_reference?: string | null
  details?: string | null
  customer_id?: string | null
  privacy_notice_version: string
}

export const createPrivacyRequestStep = createStep(
  "create-privacy-request",
  async (input: CreatePrivacyRequestStepInput, { container }) => {
    const service: PrivacyRequestModuleService = container.resolve(
      PRIVACY_REQUEST_MODULE
    )
    const now = new Date()
    const request = await service.createPrivacyRequests({
      ...input,
      email: input.email.toLowerCase(),
      reference: createPrivacyRequestReference(now),
      due_at: addCalendarMonth(now).toISOString(),
      status: "received",
      identity_status: "pending",
    })

    return new StepResponse(request, request.id)
  },
  async (requestId, { container }) => {
    if (!requestId) {
      return
    }
    const service: PrivacyRequestModuleService = container.resolve(
      PRIVACY_REQUEST_MODULE
    )
    await service.deletePrivacyRequests(requestId)
  }
)
