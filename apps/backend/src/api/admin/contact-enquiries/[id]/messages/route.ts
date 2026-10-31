import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { CONTACT_ENQUIRY_MODULE } from "../../../../../modules/contact-enquiry"
import type ContactEnquiryModuleService from "../../../../../modules/contact-enquiry/service"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const service = req.scope.resolve<ContactEnquiryModuleService>(
    CONTACT_ENQUIRY_MODULE,
  )
  const messages = await service.listContactEnquiryMessages(
    { enquiry_id: req.params.id },
    { order: { sent_at: "ASC" } },
  )

  res.json({ messages })
}
