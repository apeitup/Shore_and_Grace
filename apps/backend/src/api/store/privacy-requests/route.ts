import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { addCalendarMonth } from "../../../utils/privacy-request"
import { createPrivacyRequestWorkflow } from "../../../workflows/create-privacy-request"

export const PRIVACY_NOTICE_VERSION = "privacy_v1_2026-10-28"

export const PostStorePrivacyRequestSchema = z.object({
  request_type: z.enum([
    "access",
    "correction",
    "deletion",
    "restriction",
    "objection",
    "portability",
  ]),
  requester_type: z.enum(["customer", "gift_recipient", "visitor"]),
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).nullable().optional(),
  order_reference: z.string().trim().max(120).nullable().optional(),
  details: z.string().trim().max(5000).nullable().optional(),
  privacy_notice_accepted: z.literal(true),
  website: z.string().max(120).optional(),
})

type PostStorePrivacyRequestBody = z.infer<
  typeof PostStorePrivacyRequestSchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostStorePrivacyRequestBody>,
  res: MedusaResponse
) => {
  if (req.validatedBody.website) {
    const dueAt = addCalendarMonth(new Date()).toISOString()
    return res.status(201).json({
      privacy_request: {
        reference: "REQUEST-RECEIVED",
        status: "received",
        due_at: dueAt,
      },
    })
  }

  const {
    privacy_notice_accepted: _privacyNoticeAccepted,
    website: _website,
    ...input
  } = req.validatedBody
  const { result } = await createPrivacyRequestWorkflow(req.scope).run({
    input: {
      ...input,
      customer_id: req.auth_context?.actor_id ?? null,
      privacy_notice_version: PRIVACY_NOTICE_VERSION,
    },
  })

  res.status(201).json({
    privacy_request: {
      reference: result.request.reference,
      status: result.request.status,
      due_at: result.request.due_at,
    },
  })
}
