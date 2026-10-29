import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  updateContactEnquiryStep,
  UpdateContactEnquiryStepInput,
} from "./steps/update-contact-enquiry";

export const updateContactEnquiryWorkflow = createWorkflow(
  "update-contact-enquiry",
  function (input: UpdateContactEnquiryStepInput) {
    const enquiry = updateContactEnquiryStep(input);
    return new WorkflowResponse({ enquiry });
  },
);
