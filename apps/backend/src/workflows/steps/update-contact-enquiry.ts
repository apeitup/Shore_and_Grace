import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { CONTACT_ENQUIRY_MODULE } from "../../modules/contact-enquiry";
import ContactEnquiryModuleService from "../../modules/contact-enquiry/service";

export type ContactEnquiryStatus = "new" | "in_progress" | "resolved" | "spam";

export type UpdateContactEnquiryStepInput = {
  id: string;
  status?: ContactEnquiryStatus;
  internal_notes?: string | null;
};

export const updateContactEnquiryStep = createStep(
  "update-contact-enquiry",
  async (input: UpdateContactEnquiryStepInput, { container }) => {
    const service: ContactEnquiryModuleService = container.resolve(
      CONTACT_ENQUIRY_MODULE,
    );
    const original = await service.retrieveContactEnquiry(input.id);
    const nextStatus = input.status ?? original.status;
    const enquiry = await service.updateContactEnquiries({
      ...input,
      resolved_at:
        nextStatus === "resolved"
          ? (original.resolved_at ?? new Date().toISOString())
          : null,
    });

    return new StepResponse(enquiry, original);
  },
  async (original, { container }) => {
    if (!original) {
      return;
    }
    const service: ContactEnquiryModuleService = container.resolve(
      CONTACT_ENQUIRY_MODULE,
    );
    await service.updateContactEnquiries(original);
  },
);
