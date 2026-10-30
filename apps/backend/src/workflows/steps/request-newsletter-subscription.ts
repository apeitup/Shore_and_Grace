import { randomBytes, createHash } from "node:crypto"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import NewsletterModuleService from "../../modules/newsletter/service"

export type RequestNewsletterSubscriptionStepInput = {
  email: string
  consent_source?: string
}

type PreviousSubscription = {
  id: string
  status: "pending" | "subscribed" | "unsubscribed"
  confirmation_token_hash?: string | null
  confirmation_expires_at?: Date | null
  confirmed_at?: Date | null
  unsubscribed_at?: Date | null
  consented_at?: Date | null
}

type CompensationData = {
  created: boolean
  id: string
  previous?: PreviousSubscription
}

type RequestNewsletterSubscriptionStepOutput = {
  id: string
  email: string
  should_send: boolean
  confirmation_token: string | null
  confirmation_token_hash: string | null
}

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex")

export const requestNewsletterSubscriptionStep = createStep(
  "request-newsletter-subscription",
  async (
    input: RequestNewsletterSubscriptionStepInput,
    { container }
  ): Promise<
    StepResponse<RequestNewsletterSubscriptionStepOutput, CompensationData>
  > => {
    const service: NewsletterModuleService = container.resolve(
      NEWSLETTER_MODULE
    )
    const email = input.email.trim().toLowerCase()
    const [existing] = await service.listNewsletterSubscriptions({ email })

    if (existing?.status === "subscribed") {
      return new StepResponse(
        {
          id: existing.id,
          email,
          should_send: false,
          confirmation_token: null,
          confirmation_token_hash: null,
        },
        { created: false, id: existing.id } satisfies CompensationData
      )
    }

    const confirmationToken = randomBytes(32).toString("base64url")
    const confirmationTokenHash = hashToken(confirmationToken)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const previous = existing
      ? {
          id: existing.id,
          status: existing.status,
          confirmation_token_hash: existing.confirmation_token_hash,
          confirmation_expires_at: existing.confirmation_expires_at,
          confirmed_at: existing.confirmed_at,
          unsubscribed_at: existing.unsubscribed_at,
          consented_at: existing.consented_at,
        }
      : undefined
    const subscription = existing
      ? await service.updateNewsletterSubscriptions({
          id: existing.id,
          status: "pending",
          confirmation_token_hash: confirmationTokenHash,
          confirmation_expires_at: expiresAt,
          confirmed_at: null,
          unsubscribed_at: null,
          consented_at: null,
          consent_source: input.consent_source || "storefront_footer",
        })
      : await service.createNewsletterSubscriptions({
          email,
          status: "pending",
          confirmation_token_hash: confirmationTokenHash,
          confirmation_expires_at: expiresAt,
          consent_source: input.consent_source || "storefront_footer",
        })

    return new StepResponse(
      {
        id: subscription.id,
        email,
        should_send: true,
        confirmation_token: confirmationToken,
        confirmation_token_hash: confirmationTokenHash,
      },
      {
        created: !existing,
        id: subscription.id,
        previous,
      } satisfies CompensationData
    )
  },
  async (compensationData: CompensationData | undefined, { container }) => {
    if (!compensationData) {
      return
    }

    const service: NewsletterModuleService = container.resolve(
      NEWSLETTER_MODULE
    )

    if (compensationData.created) {
      await service.deleteNewsletterSubscriptions(compensationData.id)
      return
    }

    if (compensationData.previous) {
      await service.updateNewsletterSubscriptions(compensationData.previous)
    }
  }
)

export { hashToken }
