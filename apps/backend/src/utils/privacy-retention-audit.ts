import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { PRIVACY_REQUEST_MODULE } from "../modules/privacy-request"
import type PrivacyRequestModuleService from "../modules/privacy-request/service"

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

export type PrivacyRetentionAuditCutoffs = {
  abandoned_cart_before: string
  overdue_rights_request_before: string
  closed_rights_request_before: string
}

export type PrivacyRetentionAuditReport = {
  generated_at: string
  mode: "report_only"
  deletion_performed: false
  proposed_rules: {
    abandoned_cart_days: 30
    closed_rights_request_years: 3
  }
  candidate_counts: {
    abandoned_carts: number
    overdue_rights_requests: number
    closed_rights_requests_past_proposed_retention: number
  }
  excluded_rules: string[]
}

const subtractCalendarYears = (date: Date, years: number) => {
  const year = date.getUTCFullYear() - years
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  const lastDayOfTargetMonth = new Date(
    Date.UTC(year, month + 1, 0)
  ).getUTCDate()
  const result = new Date(date)

  result.setUTCDate(1)
  result.setUTCFullYear(year)
  result.setUTCMonth(month)
  result.setUTCDate(Math.min(day, lastDayOfTargetMonth))

  return result
}

export const getPrivacyRetentionAuditCutoffs = (
  now = new Date()
): PrivacyRetentionAuditCutoffs => ({
  abandoned_cart_before: new Date(
    now.getTime() - 30 * DAY_IN_MILLISECONDS
  ).toISOString(),
  overdue_rights_request_before: now.toISOString(),
  closed_rights_request_before: subtractCalendarYears(now, 3).toISOString(),
})

export const runPrivacyRetentionAudit = async (
  container: MedusaContainer,
  now = new Date()
): Promise<PrivacyRetentionAuditReport> => {
  const cartService = container.resolve(Modules.CART)
  const privacyRequestService: PrivacyRequestModuleService = container.resolve(
    PRIVACY_REQUEST_MODULE
  )
  const cutoffs = getPrivacyRetentionAuditCutoffs(now)

  const [, abandonedCarts] = await cartService.listAndCountCarts(
    {
      completed_at: {
        $eq: null as never,
      },
      updated_at: {
        $lte: cutoffs.abandoned_cart_before,
      },
    },
    {
      select: ["id"],
      take: 1,
    }
  )

  const [, overdueRightsRequests] =
    await privacyRequestService.listAndCountPrivacyRequests(
      {
        status: ["received", "identity_check", "in_progress"],
        due_at: {
          $lt: cutoffs.overdue_rights_request_before,
        },
      },
      {
        select: ["id"],
        take: 1,
      }
    )

  const [, closedRightsRequests] =
    await privacyRequestService.listAndCountPrivacyRequests(
      {
        status: ["completed", "rejected"],
        completed_at: {
          $lte: cutoffs.closed_rights_request_before,
        },
      },
      {
        select: ["id"],
        take: 1,
      }
    )

  return {
    generated_at: now.toISOString(),
    mode: "report_only",
    deletion_performed: false,
    proposed_rules: {
      abandoned_cart_days: 30,
      closed_rights_request_years: 3,
    },
    candidate_counts: {
      abandoned_carts: abandonedCarts,
      overdue_rights_requests: overdueRightsRequests,
      closed_rights_requests_past_proposed_retention: closedRightsRequests,
    },
    excluded_rules: [
      "Unverified registrations need a durable pending-registration marker before they can be identified safely.",
      "Delivery and gift-message expiry needs an actual delivered/completed timestamp rather than an order or requested-delivery date.",
      "Orders, payments, logs, processor records and backups require approved periods and provider procedures.",
    ],
  }
}

export const logPrivacyRetentionAudit = async (
  container: MedusaContainer,
  now = new Date()
) => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const report = await runPrivacyRetentionAudit(container, now)

  logger.info(`[privacy-retention-audit] ${JSON.stringify(report)}`)

  return report
}
