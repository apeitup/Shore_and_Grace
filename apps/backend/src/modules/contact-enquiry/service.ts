import { MedusaService } from "@medusajs/framework/utils";
import ContactEnquiry from "./models/contact-enquiry";
import ContactEnquiryMessage from "./models/contact-enquiry-message";

class ContactEnquiryModuleService extends MedusaService({
  ContactEnquiry,
  ContactEnquiryMessage,
}) {}

export default ContactEnquiryModuleService;
