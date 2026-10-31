import { Trash } from "@medusajs/icons"
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
  usePrompt,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import { NewsletterNav } from "./newsletter-nav"

type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "archived"
type CampaignKind = "newsletter" | "template"

type Campaign = {
  id: string
  name: string
  subject?: string | null
  preheader?: string | null
  status: CampaignStatus
  kind: CampaignKind
  season?: string | null
  content: Record<string, unknown>
  scheduled_at?: string | null
  sent_at?: string | null
  created_at: string
  updated_at: string
}

type CampaignResponse = {
  newsletters: Campaign[]
  count: number
}

const statusColors: Record<CampaignStatus, "grey" | "orange" | "green" | "blue"> = {
  draft: "grey",
  scheduled: "blue",
  sending: "orange",
  sent: "green",
  archived: "grey",
}

const formatDate = (date?: string | null) => date
  ? new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  : "—"

const columnHelper = createDataTableColumnHelper<Campaign>()

export const CampaignList = ({ kind }: { kind: CampaignKind }) => {
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<CampaignStatus | "all">("all")
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const prompt = usePrompt()
  const queryClient = useQueryClient()
  const offset = pagination.pageIndex * pagination.pageSize
  const plural = kind === "template" ? "Templates" : "Newsletters"

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const { data, isLoading } = useQuery<CampaignResponse>({
    queryKey: [
      "newsletter-campaigns",
      kind,
      offset,
      pagination.pageSize,
      search,
      status,
    ],
    queryFn: () => sdk.client.fetch("/admin/newsletters", {
      query: {
        kind,
        status: status === "all" ? undefined : status,
        q: search || undefined,
        offset,
        limit: pagination.pageSize,
      },
    }),
  })

  const deleteCampaign = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/newsletters/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-campaigns"] })
      toast.success(`${kind === "template" ? "Template" : "Newsletter"} deleted`)
    },
    onError: (error: Error) => toast.error(error.message || "Unable to delete item"),
  })

  const duplicateCampaign = useMutation({
    mutationFn: ({ campaign, nextKind }: { campaign: Campaign; nextKind: CampaignKind }) =>
      sdk.client.fetch<{ newsletter: Campaign }>("/admin/newsletters", {
        method: "POST",
        body: {
          name: `${campaign.name}${nextKind === "template" ? " template" : " copy"}`,
          subject: campaign.subject,
          preheader: campaign.preheader,
          status: "draft",
          kind: nextKind,
          season: campaign.season,
          content: campaign.content,
        },
      }),
    onSuccess: ({ newsletter }) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-campaigns"] })
      toast.success(newsletter.kind === "template" ? "Template saved" : "Newsletter duplicated")
    },
    onError: (error: Error) => toast.error(error.message || "Unable to duplicate item"),
  })

  const remove = async (campaign: Campaign) => {
    const confirmed = await prompt({
      title: `Delete ${campaign.name}?`,
      description: "This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (confirmed) {
      deleteCampaign.mutate(campaign.id)
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Text size="small" weight="plus">{row.original.name}</Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {row.original.subject || "No subject yet"}
          </Text>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge color={statusColors[row.original.status]}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </StatusBadge>
      ),
    }),
    columnHelper.accessor("season", {
      header: "Season",
      cell: ({ row }) => row.original.season || "—",
    }),
    columnHelper.accessor("updated_at", {
      header: "Last updated",
      cell: ({ row }) => formatDate(row.original.updated_at),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild size="small" variant="secondary">
            <Link to={`/newsletter/builder?id=${row.original.id}`}>Edit</Link>
          </Button>
          {row.original.kind === "template" && (
            <Button asChild size="small">
              <Link to={`/newsletter/builder?template=${row.original.id}&kind=newsletter`}>
                Use template
              </Link>
            </Button>
          )}
          {row.original.kind === "newsletter" && (
            <>
              <Button asChild size="small" variant="secondary">
                <Link to={`/newsletter/newsletters/${row.original.id}`}>Report</Link>
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => duplicateCampaign.mutate({
                  campaign: row.original,
                  nextKind: "template",
                })}
              >
                Save as template
              </Button>
            </>
          )}
          <Button
            size="small"
            variant="secondary"
            onClick={() => duplicateCampaign.mutate({
              campaign: row.original,
              nextKind: row.original.kind,
            })}
          >
            Duplicate
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => remove(row.original)}
            disabled={row.original.status === "sending"}
          >
            <Trash />
            Delete
          </Button>
        </div>
      ),
    }),
  ], [duplicateCampaign, kind])

  const table = useDataTable({
    columns,
    data: data?.newsletters || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  })

  return (
    <div className="flex flex-col gap-3">
      <NewsletterNav />
      <Container className="p-0">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div>
              <Heading>{plural}</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {kind === "template"
                  ? "Reusable starting points for future campaigns."
                  : "Create, edit and manage email campaigns."}
              </Text>
            </div>
            <Button asChild size="small">
              <Link to={`/newsletter/builder?kind=${kind}`}>
                {kind === "template" ? "Create template" : "Create newsletter"}
              </Link>
            </Button>
          </DataTable.Toolbar>
          <DataTable.Toolbar className="flex flex-wrap gap-2 border-t px-6 py-3">
            <Input
              aria-label={`Search ${plural.toLowerCase()}`}
              placeholder={`Search ${plural.toLowerCase()}`}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full md:w-[320px]"
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as CampaignStatus | "all")
                setPagination((current) => ({ ...current, pageIndex: 0 }))
              }}
            >
              <Select.Trigger className="w-full md:w-[180px]">
                <Select.Value placeholder="All statuses" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All statuses</Select.Item>
                <Select.Item value="draft">Draft</Select.Item>
                <Select.Item value="scheduled">Scheduled</Select.Item>
                <Select.Item value="sending">Sending</Select.Item>
                <Select.Item value="sent">Sent</Select.Item>
                <Select.Item value="archived">Archived</Select.Item>
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
