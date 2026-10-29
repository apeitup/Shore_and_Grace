import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { updateContactEnquiryWorkflow } from "../../../../workflows/update-contact-enquiry";

export const PostAdminContactEnquirySchema = z
  .object({
    status: z.enum(["new", "in_progress", "resolved", "spam"]).optional(),
    internal_notes: z.string().trim().max(5000).nullable().optional(),
  })
  .refine(
    (value) => value.status !== undefined || value.internal_notes !== undefined,
    { message: "Provide at least one field to update." },
  );

type PostAdminContactEnquiryBody = z.infer<
  typeof PostAdminContactEnquirySchema
>;

export const POST = async (
  req: MedusaRequest<PostAdminContactEnquiryBody>,
  res: MedusaResponse,
) => {
  const { result } = await updateContactEnquiryWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  });

  res.json(result);
};
