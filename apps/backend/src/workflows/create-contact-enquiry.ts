import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { emitEventStep } from "@medusajs/medusa/core-flows";
import {
  createContactEnquiryStep,
  CreateContactEnquiryStepInput,
} from "./steps/create-contact-enquiry";

export const createContactEnquiryWorkflow = createWorkflow(
  "create-contact-enquiry",
  function (input: CreateContactEnquiryStepInput) {
    const enquiry = createContactEnquiryStep(input);
    const eventData = transform({ enquiry }, ({ enquiry }) => ({
      id: enquiry.id,
    }));

    emitEventStep({
      eventName: "contact_enquiry.created",
      data: eventData,
    });

    return new WorkflowResponse({ enquiry });
  },
);
