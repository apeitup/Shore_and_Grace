import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"
import type NewsletterModuleService from "../../../modules/newsletter/service"

export const NewsletterStatusSchema = z.enum([
  "pending",
  "subscribed",
  "unsubscribed",
])

export const GetAdminNewsletterSubscriptionsSchema = createFindParams().extend({
  q: z.string().trim().max(200).optional(),
  status: NewsletterStatusSchema.optional(),
})

type NewsletterStatus = z.infer<typeof NewsletterStatusSchema>

type NewsletterSubscription = {
  id: string
  email: string
  status: NewsletterStatus
  consent_source: string
  consented_at?: Date | string | null
  confirmed_at?: Date | string | null
  unsubscribed_at?: Date | string | null
  created_at: Date | string
  updated_at: Date | string
}

type NewsletterFilter = {
  id?: string[]
  status?: NewsletterStatus
  email?: { $ilike: string }
}

export const buildNewsletterFilter = (
  query: Record<string, unknown>,
): NewsletterFilter => {
  const filter: NewsletterFilter = {}
  const status = query.status
  const search = typeof query.q === "string" ? query.q.trim() : ""

  if (NewsletterStatusSchema.safeParse(status).success) {
    filter.status = status as NewsletterStatus
  }

  if (search) {
    filter.email = { $ilike: `%${search}%` }
  }

  return filter
}

export const toAdminNewsletterSubscription = (
  subscription: NewsletterSubscription,
) => ({
  id: subscription.id,
  email: subscription.email,
  status: subscription.status,
  consent_source: subscription.consent_source,
  consented_at: subscription.consented_at,
  confirmed_at: subscription.confirmed_at,
  unsubscribed_at: subscription.unsubscribed_at,
  created_at: subscription.created_at,
  updated_at: subscription.updated_at,
})

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const newsletterService = req.scope.resolve<NewsletterModuleService>(
    NEWSLETTER_MODULE,
  )
  const query = req.validatedQuery as Record<string, unknown>
  const limit = typeof query.limit === "number" ? query.limit : 25
  const offset = typeof query.offset === "number" ? query.offset : 0
  const filter = buildNewsletterFilter(query)

  const [[subscriptions, count], pending, subscribed, unsubscribed] =
    await Promise.all([
      newsletterService.listAndCountNewsletterSubscriptions(filter, {
        skip: offset,
        take: limit,
        order: { created_at: "DESC" },
      }),
      newsletterService
        .listAndCountNewsletterSubscriptions({ status: "pending" }, { take: 1 })
        .then((result) => result[1]),
      newsletterService
        .listAndCountNewsletterSubscriptions(
          { status: "subscribed" },
          { take: 1 },
        )
        .then((result) => result[1]),
      newsletterService
        .listAndCountNewsletterSubscriptions(
          { status: "unsubscribed" },
          { take: 1 },
        )
        .then((result) => result[1]),
    ])

  res.json({
    newsletter_subscriptions: subscriptions.map(
      toAdminNewsletterSubscription,
    ),
    count,
    limit,
    offset,
    summary: {
      total: pending + subscribed + unsubscribed,
      pending,
      subscribed,
      unsubscribed,
    },
  })
}
