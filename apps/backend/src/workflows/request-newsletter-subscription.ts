import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import {
  requestNewsletterSubscriptionStep,
  RequestNewsletterSubscriptionStepInput,
} from "./steps/request-newsletter-subscription"

export const requestNewsletterSubscriptionWorkflow = createWorkflow(
  "request-newsletter-subscription",
  function (input: RequestNewsletterSubscriptionStepInput) {
    const subscription = requestNewsletterSubscriptionStep(input)
    const eventData = transform(
      { subscription },
      ({ subscription }) => ({
        id: subscription.id,
        email: subscription.email,
        should_send: subscription.should_send,
        confirmation_token: subscription.confirmation_token,
        confirmation_token_hash: subscription.confirmation_token_hash,
      })
    )

    emitEventStep({
      eventName: "newsletter.confirmation_requested",
      data: eventData,
    })

    return new WorkflowResponse({ subscription })
  }
)
