export type NewsletterCsvRow = {
  email: string
  status: string
  consent_source: string
  consented_at?: Date | string | null
  confirmed_at?: Date | string | null
  unsubscribed_at?: Date | string | null
  created_at: Date | string
}

const formatDate = (value?: Date | string | null) => {
  if (!value) {
    return ""
  }

  return new Date(value).toISOString()
}

const escapeCsvValue = (value: string) => {
  const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value

  return `"${safeValue.replace(/"/g, '""')}"`
}

export const createNewsletterCsv = (rows: NewsletterCsvRow[]) => {
  const headings = [
    "Email",
    "Status",
    "Consent source",
    "Consented at",
    "Confirmed at",
    "Unsubscribed at",
    "Created at",
  ]

  const dataRows = rows.map((row) =>
    [
      row.email,
      row.status,
      row.consent_source,
      formatDate(row.consented_at),
      formatDate(row.confirmed_at),
      formatDate(row.unsubscribed_at),
      formatDate(row.created_at),
    ]
      .map(escapeCsvValue)
      .join(","),
  )

  return [headings.map(escapeCsvValue).join(","), ...dataRows].join("\n")
}
