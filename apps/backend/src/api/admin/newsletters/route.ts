import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"
import type NewsletterModuleService from "../../../modules/newsletter/service"
import { saveNewsletterCampaignWorkflow } from "../../../workflows/save-newsletter-campaign"

export const NewsletterCampaignStatusSchema = z.enum([
  "draft",
  "scheduled",
  "sending",
  "sent",
  "archived",
])

export const NewsletterCampaignKindSchema = z.enum([
  "newsletter",
  "template",
])

export const GetAdminNewslettersSchema = createFindParams().extend({
  q: z.string().trim().max(200).optional(),
  status: NewsletterCampaignStatusSchema.optional(),
  kind: NewsletterCampaignKindSchema.optional(),
  season: z.string().trim().max(100).optional(),
})

export const PostAdminNewsletterSchema = z.object({
  name: z.string().trim().min(1).max(200),
  subject: z.string().trim().max(300).nullable().optional(),
  preheader: z.string().trim().max(500).nullable().optional(),
  status: NewsletterCampaignStatusSchema.optional(),
  kind: NewsletterCampaignKindSchema.optional(),
  season: z.string().trim().max(100).nullable().optional(),
  content: z.record(z.string(), z.unknown()),
  html: z.string().nullable().optional(),
  scheduled_at: z.iso.datetime().nullable().optional(),
  sent_at: z.iso.datetime().nullable().optional(),
})

export type PostAdminNewsletter = z.infer<typeof PostAdminNewsletterSchema>

type NewsletterFilter = {
  name?: { $ilike: string }
  status?: z.infer<typeof NewsletterCampaignStatusSchema>
  kind?: z.infer<typeof NewsletterCampaignKindSchema>
  season?: string
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const service = req.scope.resolve<NewsletterModuleService>(
    NEWSLETTER_MODULE,
  )
  const query = req.validatedQuery as Record<string, unknown>
  const limit = typeof query.limit === "number" ? query.limit : 25
  const offset = typeof query.offset === "number" ? query.offset : 0
  const filter: NewsletterFilter = {}
  const search = typeof query.q === "string" ? query.q.trim() : ""

  if (search) {
    filter.name = { $ilike: `%${search}%` }
  }

  if (NewsletterCampaignStatusSchema.safeParse(query.status).success) {
    filter.status = query.status as NewsletterFilter["status"]
  }

  if (NewsletterCampaignKindSchema.safeParse(query.kind).success) {
    filter.kind = query.kind as NewsletterFilter["kind"]
  }

  if (typeof query.season === "string" && query.season.trim()) {
    filter.season = query.season.trim()
  }

  const [newsletters, count] = await service.listAndCountNewsletterCampaigns(
    filter,
    {
      skip: offset,
      take: limit,
      order: { updated_at: "DESC" },
    },
  )

  res.json({ newsletters, count, limit, offset })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminNewsletter>,
  res: MedusaResponse,
) => {
  const { result } = await saveNewsletterCampaignWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(201).json({ newsletter: result.campaign })
}
