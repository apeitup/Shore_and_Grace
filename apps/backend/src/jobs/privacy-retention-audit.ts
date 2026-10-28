import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { logPrivacyRetentionAudit } from "../utils/privacy-retention-audit"

export default async function privacyRetentionAuditJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (process.env.PRIVACY_RETENTION_AUDIT_ENABLED !== "true") {
    logger.info(
      "[privacy-retention-audit] Scheduled report skipped because PRIVACY_RETENTION_AUDIT_ENABLED is not true."
    )
    return
  }

  await logPrivacyRetentionAudit(container)
}

export const config = {
  name: "privacy-retention-audit",
  schedule: "15 3 * * *",
}
