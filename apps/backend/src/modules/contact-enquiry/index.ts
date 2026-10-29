import { Module } from "@medusajs/framework/utils";
import ContactEnquiryModuleService from "./service";

export const CONTACT_ENQUIRY_MODULE = "contactEnquiry";

export default Module(CONTACT_ENQUIRY_MODULE, {
  service: ContactEnquiryModuleService,
});
