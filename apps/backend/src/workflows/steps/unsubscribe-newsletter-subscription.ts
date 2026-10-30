import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import NewsletterModuleService from "../../modules/newsletter/service"
import { verifyNewsletterUnsubscribeToken } from "../../utils/newsletter-unsubscribe-token"

export type UnsubscribeNewsletterSubscriptionStepInput = {
  token: string
}

type PreviousSubscription = {
  id: string
  status: "pending" | "subscribed" | "unsubscribed"
  confirmation_token_hash?: string | null
  confirmation_expires_at?: Date | null
  unsubscribed_at?: Date | null
}

type UnsubscribeNewsletterSubscriptionStepOutput = {
  id: string
  status: "unsubscribed"
}

export const unsubscribeNewsletterSubscriptionStep = createStep(
  "unsubscribe-newsletter-subscription",
  async (
    input: UnsubscribeNewsletterSubscriptionStepInput,
    { container }
  ): Promise<
    StepResponse<
      UnsubscribeNewsletterSubscriptionStepOutput,
      PreviousSubscription
    >
  > => {
    const subscriptionId = verifyNewsletterUnsubscribeToken(input.token)

    if (!subscriptionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This unsubscribe link is invalid."
      )
    }

    const service: NewsletterModuleService = container.resolve(
      NEWSLETTER_MODULE
    )
    const subscription = await service.retrieveNewsletterSubscription(
      subscriptionId
    )
    const previous: PreviousSubscription = {
      id: subscription.id,
      status: subscription.status,
      confirmation_token_hash: subscription.confirmation_token_hash,
      confirmation_expires_at: subscription.confirmation_expires_at,
      unsubscribed_at: subscription.unsubscribed_at,
    }

    if (subscription.status === "unsubscribed") {
      return new StepResponse(
        { id: subscription.id, status: "unsubscribed" },
        previous
      )
    }

    const unsubscribed = await service.updateNewsletterSubscriptions({
      id: subscription.id,
      status: "unsubscribed",
      unsubscribed_at: new Date(),
      confirmation_token_hash: null,
      confirmation_expires_at: null,
    })

    return new StepResponse(
      { id: unsubscribed.id, status: "unsubscribed" },
      previous
    )
  },
  async (previous: PreviousSubscription | undefined, { container }) => {
    if (!previous) {
      return
    }

    const service: NewsletterModuleService = container.resolve(
      NEWSLETTER_MODULE
    )
    await service.updateNewsletterSubscriptions(previous)
  }
)
