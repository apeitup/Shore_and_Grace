import { Button, Container, Heading, StatusBadge, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { sdk } from "../../../../lib/sdk"
import { NewsletterNav } from "../../components/newsletter-nav"

type Campaign = {
  id: string
  name: string
  subject?: string | null
  status: "draft" | "scheduled" | "sending" | "sent" | "archived"
  scheduled_at?: string | null
  sent_at?: string | null
}

type Report = Record<
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "unsubscribed"
  | "converted"
  | "failed",
  number
>

const NewsletterReportPage = () => {
  const { id = "" } = useParams()
  const campaign = useQuery<{ newsletter: Campaign }>({
    queryKey: ["newsletter-campaign", id],
    queryFn: () => sdk.client.fetch(`/admin/newsletters/${id}`),
    enabled: Boolean(id),
  })
  const report = useQuery<{ report: Report; tracking_enabled: boolean }>({
    queryKey: ["newsletter-report", id],
    queryFn: () => sdk.client.fetch(`/admin/newsletters/${id}/report`),
    enabled: Boolean(id),
    refetchInterval: 30_000,
  })
  const item = campaign.data?.newsletter
  const values = report.data?.report
  const sentCount = values?.sent || 0
  const percentage = (value: number) =>
    sentCount ? `${((value / sentCount) * 100).toFixed(1)}%` : "—"
  const cards = [
    { label: "Queued", value: values?.queued || 0 },
    { label: "Sent", value: values?.sent || 0 },
    { label: "Failed", value: values?.failed || 0 },
    {
      label: "Opened",
      value: values?.opened || 0,
      detail: percentage(values?.opened || 0),
    },
    {
      label: "Clicked",
      value: values?.clicked || 0,
      detail: percentage(values?.clicked || 0),
    },
    {
      label: "Unsubscribed",
      value: values?.unsubscribed || 0,
      detail: percentage(values?.unsubscribed || 0),
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <NewsletterNav />
      <Container className="flex flex-wrap items-start justify-between gap-3 p-6">
        <div>
          <div className="flex items-center gap-2">
            <Heading>{item?.name || "Newsletter report"}</Heading>
            {item && <StatusBadge color={item.status === "sent" ? "green" : "grey"}>{item.status}</StatusBadge>}
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            {item?.subject || "Campaign delivery and engagement"}
          </Text>
        </div>
        <div className="flex gap-2">
          <Button asChild size="small" variant="secondary">
            <Link to="/newsletter/newsletters">Back</Link>
          </Button>
          {item && item.status !== "sent" && (
            <Button asChild size="small">
              <Link to={`/newsletter/builder?id=${item.id}`}>Edit</Link>
            </Button>
          )}
        </div>
      </Container>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <Container key={card.label} className="flex flex-col gap-1 p-5">
            <Text size="small" className="text-ui-fg-subtle">{card.label}</Text>
            <Heading level="h2">{card.value.toLocaleString("en-GB")}</Heading>
            {card.detail && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                {card.detail} of sent
              </Text>
            )}
          </Container>
        ))}
      </div>
      <Container className="p-5">
        <Heading level="h2">Tracking note</Heading>
        <Text size="small" className="mt-1 text-ui-fg-subtle">
          Sent, failed and unsubscribe counts are recorded directly. Namecheap SMTP does not provide reliable delivery, bounce or complaint webhooks, so those figures remain unavailable until a transactional email provider is connected. {report.data?.tracking_enabled
            ? "Privacy-controlled first-party open and click tracking is enabled."
            : "Open and click tracking is disabled. Enable it only after the privacy notice has been updated."}
        </Text>
      </Container>
    </div>
  )
}

export default NewsletterReportPage
