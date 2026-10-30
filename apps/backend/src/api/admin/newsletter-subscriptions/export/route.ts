import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"
import type NewsletterModuleService from "../../../../modules/newsletter/service"
import { createNewsletterCsv } from "../../../../utils/newsletter-csv"
import {
  buildNewsletterFilter,
  NewsletterStatusSchema,
  toAdminNewsletterSubscription,
} from "../route"

export const GetAdminNewsletterExportSchema = createFindParams().extend({
  q: z.string().trim().max(200).optional(),
  status: NewsletterStatusSchema.optional(),
})

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const newsletterService = req.scope.resolve<NewsletterModuleService>(
    NEWSLETTER_MODULE,
  )
  const filter = buildNewsletterFilter(
    req.validatedQuery as Record<string, unknown>,
  )
  const subscriptions: ReturnType<typeof toAdminNewsletterSubscription>[] = []
  const batchSize = 500
  let offset = 0
  let count = 0

  do {
    const [batch, total] =
      await newsletterService.listAndCountNewsletterSubscriptions(filter, {
        skip: offset,
        take: batchSize,
        order: { created_at: "DESC" },
      })

    subscriptions.push(...batch.map(toAdminNewsletterSubscription))
    count = total
    offset += batch.length
  } while (offset < count)

  const date = new Date().toISOString().slice(0, 10)

  res.json({
    filename: `shore-and-grace-newsletter-${date}.csv`,
    csv: createNewsletterCsv(subscriptions),
    count,
  })
}
