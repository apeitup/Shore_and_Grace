import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowDownTray, Envelope } from "@medusajs/icons"
import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  Input,
  Select,
  StatusBadge,
  Text,
  toast,
  useDataTable,
} from "@medusajs/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"

type NewsletterStatus = "pending" | "subscribed" | "unsubscribed"

type NewsletterSubscription = {
  id: string
  email: string
  status: NewsletterStatus
  consent_source: string
  consented_at?: string | null
  confirmed_at?: string | null
  unsubscribed_at?: string | null
  created_at: string
}

type NewsletterResponse = {
  newsletter_subscriptions: NewsletterSubscription[]
  count: number
  summary: {
    total: number
    pending: number
    subscribed: number
    unsubscribed: number
  }
}

type NewsletterExportResponse = {
  filename: string
  csv: string
  count: number
}

const statusLabels: Record<NewsletterStatus, string> = {
  pending: "Pending confirmation",
  subscribed: "Subscribed",
  unsubscribed: "Unsubscribed",
}

const statusColors: Record<NewsletterStatus, "orange" | "green" | "grey"> = {
  pending: "orange",
  subscribed: "green",
  unsubscribed: "grey",
}

const formatSource = (source: string) =>
  source
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ")

const formatDate = (date?: string | null) =>
  date
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date))
    : "—"

const columnHelper = createDataTableColumnHelper<NewsletterSubscription>()
const pageSize = 25

const NewsletterPage = () => {
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const offset = pagination.pageIndex * pagination.pageSize

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const query = {
    offset,
    limit: pagination.pageSize,
    q: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  }

  const { data, isLoading } = useQuery<NewsletterResponse>({
    queryKey: [
      "newsletter-subscriptions",
      offset,
      pagination.pageSize,
      search,
      statusFilter,
    ],
    queryFn: () =>
      sdk.client.fetch("/admin/newsletter-subscriptions", { query }),
  })

  const exportSubscriptions = useMutation({
    mutationFn: () =>
      sdk.client.fetch<NewsletterExportResponse>(
        "/admin/newsletter-subscriptions/export",
        {
          query: {
            q: search || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
          },
        },
      ),
    onSuccess: ({ csv, filename, count }) => {
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      )
      const link = document.createElement("a")

      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${count} newsletter records`)
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to export newsletter records"),
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor("email", {
        header: "Email",
        cell: ({ row }) => (
          <Text size="small" weight="plus">
            {row.original.email}
          </Text>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge color={statusColors[row.original.status]}>
            {statusLabels[row.original.status]}
          </StatusBadge>
        ),
      }),
      columnHelper.accessor("consent_source", {
        header: "Consent source",
        cell: ({ row }) => formatSource(row.original.consent_source),
      }),
      columnHelper.accessor("consented_at", {
        header: "Consent recorded",
        cell: ({ row }) => formatDate(row.original.consented_at),
      }),
      columnHelper.accessor("confirmed_at", {
        header: "Confirmed",
        cell: ({ row }) => formatDate(row.original.confirmed_at),
      }),
      columnHelper.accessor("unsubscribed_at", {
        header: "Unsubscribed",
        cell: ({ row }) => formatDate(row.original.unsubscribed_at),
      }),
      columnHelper.accessor("created_at", {
        header: "First recorded",
        cell: ({ row }) => formatDate(row.original.created_at),
      }),
    ],
    [],
  )

  const table = useDataTable({
    columns,
    data: data?.newsletter_subscriptions || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  })

  const summary = data?.summary || {
    total: 0,
    pending: 0,
    subscribed: 0,
    unsubscribed: 0,
  }

  const summaryCards = [
    { label: "All records", value: summary.total },
    { label: "Subscribed", value: summary.subscribed },
    { label: "Pending", value: summary.pending },
    { label: "Unsubscribed", value: summary.unsubscribed },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {summaryCards.map((card) => (
          <Container key={card.label} className="flex flex-col gap-1 p-4">
            <Text size="small" className="text-ui-fg-subtle">
              {card.label}
            </Text>
            <Heading level="h2">{card.value.toLocaleString("en-GB")}</Heading>
          </Container>
        ))}
      </div>

      <Container className="p-0">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div>
              <Heading>Newsletter</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                View subscribers and the consent evidence recorded for each
                address.
              </Text>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={() => exportSubscriptions.mutate()}
              isLoading={exportSubscriptions.isPending}
            >
              <ArrowDownTray />
              Export CSV
            </Button>
          </DataTable.Toolbar>
          <DataTable.Toolbar className="flex flex-wrap items-center gap-2 border-t px-6 py-3">
            <Input
              aria-label="Search newsletter subscriptions"
              placeholder="Search email addresses"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full md:w-[280px]"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setPagination((current) => ({ ...current, pageIndex: 0 }))
              }}
            >
              <Select.Trigger
                aria-label="Filter newsletter subscriptions by status"
                className="w-full md:w-[200px]"
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All statuses</Select.Item>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Newsletter",
  icon: Envelope,
})

export default NewsletterPage
