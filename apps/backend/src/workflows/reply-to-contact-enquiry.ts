import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  sendContactEnquiryReplyStep,
  type SendContactEnquiryReplyStepInput,
} from "./steps/send-contact-enquiry-reply"

export const replyToContactEnquiryWorkflow = createWorkflow(
  "reply-to-contact-enquiry",
  function (input: SendContactEnquiryReplyStepInput) {
    const reply = sendContactEnquiryReplyStep(input)
    return new WorkflowResponse({ reply })
  },
)
