import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { replyToContactEnquiryWorkflow } from "../../../../../workflows/reply-to-contact-enquiry"

export const PostAdminContactEnquiryReplySchema = z.object({
  request_id: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(10000),
})

type PostAdminContactEnquiryReply = z.infer<
  typeof PostAdminContactEnquiryReplySchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminContactEnquiryReply>,
  res: MedusaResponse,
) => {
  const { result } = await replyToContactEnquiryWorkflow(req.scope).run({
    input: {
      enquiry_id: req.params.id,
      sent_by_user_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })

  res.status(201).json(result)
}
