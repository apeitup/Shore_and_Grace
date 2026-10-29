import { MedusaService } from "@medusajs/framework/utils";
import ContactEnquiry from "./models/contact-enquiry";

class ContactEnquiryModuleService extends MedusaService({
  ContactEnquiry,
}) {}

export default ContactEnquiryModuleService;
