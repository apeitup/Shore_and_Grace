import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { CONTACT_ENQUIRY_MODULE } from "../modules/contact-enquiry";
import ContactEnquiryModuleService from "../modules/contact-enquiry/service";

export default async function contactEnquiryRetentionJob(
  container: MedusaContainer,
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const contactService: ContactEnquiryModuleService = container.resolve(
    CONTACT_ENQUIRY_MODULE,
  );
  const expired = await contactService.listContactEnquiries(
    {
      retained_until: { $lt: new Date().toISOString() },
    } as never,
    { select: ["id"] },
  );

  if (!expired.length) {
    return;
  }

  await contactService.deleteContactEnquiries(
    expired.map((enquiry) => enquiry.id),
  );
  logger.info(
    `[contact-enquiry-retention] Deleted ${expired.length} expired contact ${
      expired.length === 1 ? "enquiry" : "enquiries"
    }.`,
  );
}

export const config = {
  name: "contact-enquiry-retention",
  schedule: "30 3 * * *",
};
