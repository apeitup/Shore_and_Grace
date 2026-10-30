import type {
  MedusaRequest,
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

export const PostAdminNewsletterExportSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(500),
})

type NewsletterExportQuery = Record<string, unknown> & {
  ids?: string[]
}

const exportNewsletterSubscriptions = async (
  req: MedusaRequest,
  res: MedusaResponse,
  query: NewsletterExportQuery,
) => {
  const newsletterService = req.scope.resolve<NewsletterModuleService>(
    NEWSLETTER_MODULE,
  )
  const filter = buildNewsletterFilter(query)

  if (query.ids?.length) {
    filter.id = [...new Set(query.ids)]
  }

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

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse,
) => {
  await exportNewsletterSubscriptions(
    req,
    res,
    req.validatedQuery as Record<string, unknown>,
  )
}

export const POST = async (
  req: MedusaRequest<z.infer<typeof PostAdminNewsletterExportSchema>>,
  res: MedusaResponse,
) =>
  exportNewsletterSubscriptions(req, res, {
    ids: req.validatedBody.ids,
  })
