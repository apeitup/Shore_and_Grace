import type { ExecArgs } from "@medusajs/framework/types"
import { logPrivacyRetentionAudit } from "../utils/privacy-retention-audit"

export default async function runPrivacyRetentionAuditScript({
  container,
}: ExecArgs) {
  await logPrivacyRetentionAudit(container)
}
