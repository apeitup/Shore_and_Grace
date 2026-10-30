import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import NewsletterModuleService from "../../modules/newsletter/service"
import { hashToken } from "./request-newsletter-subscription"

export type ConfirmNewsletterSubscriptionStepInput = {
  token: string
}

type PreviousSubscription = {
  id: string
  status: "pending" | "subscribed" | "unsubscribed"
  confirmation_token_hash?: string | null
  confirmation_expires_at?: Date | null
  confirmed_at?: Date | null
  consented_at?: Date | null
}

type ConfirmNewsletterSubscriptionStepOutput = {
  id: string
  email: string
  status: "pending" | "subscribed" | "unsubscribed"
}

export const confirmNewsletterSubscriptionStep = createStep(
  "confirm-newsletter-subscription",
  async (
    input: ConfirmNewsletterSubscriptionStepInput,
    { container }
  ): Promise<
    StepResponse<
      ConfirmNewsletterSubscriptionStepOutput,
      PreviousSubscription
    >
  > => {
    const service: NewsletterModuleService = container.resolve(
      NEWSLETTER_MODULE
    )
    const tokenHash = hashToken(input.token)
    const [subscription] = await service.listNewsletterSubscriptions({
      confirmation_token_hash: tokenHash,
    })

    if (
      !subscription ||
      !subscription.confirmation_expires_at ||
      new Date(subscription.confirmation_expires_at).getTime() < Date.now() ||
      subscription.status === "unsubscribed"
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This confirmation link is invalid or has expired."
      )
    }

    if (subscription.status === "subscribed") {
      const previous: PreviousSubscription = {
        id: subscription.id,
        status: subscription.status,
        confirmation_token_hash: subscription.confirmation_token_hash,
        confirmation_expires_at: subscription.confirmation_expires_at,
        confirmed_at: subscription.confirmed_at,
        consented_at: subscription.consented_at,
      }
      return new StepResponse(
        {
          id: subscription.id,
          email: subscription.email,
          status: subscription.status,
        },
        previous
      )
    }

    const previous: PreviousSubscription = {
      id: subscription.id,
      status: subscription.status,
      confirmation_token_hash: subscription.confirmation_token_hash,
      confirmation_expires_at: subscription.confirmation_expires_at,
      confirmed_at: subscription.confirmed_at,
      consented_at: subscription.consented_at,
    }
    const now = new Date()
    const confirmed = await service.updateNewsletterSubscriptions({
      id: subscription.id,
      status: "subscribed",
      confirmed_at: now,
      consented_at: now,
    })

    return new StepResponse(
      { id: confirmed.id, email: confirmed.email, status: confirmed.status },
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
