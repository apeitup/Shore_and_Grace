import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { CONTACT_ENQUIRY_MODULE } from "../../modules/contact-enquiry";
import ContactEnquiryModuleService from "../../modules/contact-enquiry/service";
import {
  addRetentionYear,
  createContactEnquiryReference,
} from "../../utils/contact-enquiry";

export type ContactEnquiryCategory =
  | "order"
  | "delivery"
  | "returns"
  | "products"
  | "services"
  | "privacy"
  | "other";

export type CreateContactEnquiryStepInput = {
  name: string;
  email: string;
  phone?: string | null;
  order_reference?: string | null;
  category: ContactEnquiryCategory;
  message: string;
  privacy_notice_version: string;
};

export const createContactEnquiryStep = createStep(
  "create-contact-enquiry",
  async (input: CreateContactEnquiryStepInput, { container }) => {
    const service: ContactEnquiryModuleService = container.resolve(
      CONTACT_ENQUIRY_MODULE,
    );
    const now = new Date();
    const enquiry = await service.createContactEnquiries({
      ...input,
      email: input.email.toLowerCase(),
      reference: createContactEnquiryReference(now),
      status: "new",
      retained_until: addRetentionYear(now).toISOString(),
    });

    return new StepResponse(enquiry, enquiry.id);
  },
  async (enquiryId, { container }) => {
    if (!enquiryId) {
      return;
    }
    const service: ContactEnquiryModuleService = container.resolve(
      CONTACT_ENQUIRY_MODULE,
    );
    await service.deleteContactEnquiries(enquiryId);
  },
);
