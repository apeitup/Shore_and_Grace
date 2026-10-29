import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { createContactEnquiryWorkflow } from "../../../workflows/create-contact-enquiry";

export const CONTACT_PRIVACY_NOTICE_VERSION = "privacy_v1_2026-10-29";

export const PostStoreContactEnquirySchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).nullable().optional(),
  order_reference: z.string().trim().max(120).nullable().optional(),
  category: z.enum([
    "order",
    "delivery",
    "returns",
    "products",
    "services",
    "privacy",
    "other",
  ]),
  message: z.string().trim().min(10).max(5000),
  privacy_notice_accepted: z.literal(true),
  website: z.string().max(120).optional(),
});

type PostStoreContactEnquiryBody = z.infer<
  typeof PostStoreContactEnquirySchema
>;

export const POST = async (
  req: MedusaRequest<PostStoreContactEnquiryBody>,
  res: MedusaResponse,
) => {
  if (req.validatedBody.website) {
    return res.status(201).json({
      contact_enquiry: {
        reference: "MESSAGE-RECEIVED",
        status: "new",
      },
    });
  }

  const {
    privacy_notice_accepted: _privacyNoticeAccepted,
    website: _website,
    ...input
  } = req.validatedBody;
  const { result } = await createContactEnquiryWorkflow(req.scope).run({
    input: {
      ...input,
      privacy_notice_version: CONTACT_PRIVACY_NOTICE_VERSION,
    },
  });

  res.status(201).json({
    contact_enquiry: {
      reference: result.enquiry.reference,
      status: result.enquiry.status,
    },
  });
};
