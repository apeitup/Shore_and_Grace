import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Drawer,
  Heading,
  Label,
  Select,
  StatusBadge,
  Text,
  Textarea,
  toast,
  useDataTable,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"

type RequestStatus =
  | "received"
  | "identity_check"
  | "in_progress"
  | "completed"
  | "rejected"

type IdentityStatus = "pending" | "verified" | "failed"

type PrivacyRequest = {
  id: string
  reference: string
  request_type: string
  requester_type: string
  name: string
  email: string
  phone?: string | null
  order_reference?: string | null
  details?: string | null
  customer_id?: string | null
  status: RequestStatus
  identity_status: IdentityStatus
  due_at: string
  completed_at?: string | null
  internal_notes?: string | null
  created_at: string
}

const requestLabels: Record<string, string> = {
  access: "Access",
  correction: "Correction",
  deletion: "Deletion",
  restriction: "Restriction",
  objection: "Objection",
  portability: "Portability",
}

const statusLabels: Record<RequestStatus, string> = {
  received: "Received",
  identity_check: "Identity check",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
}

const identityLabels: Record<IdentityStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  failed: "Failed",
}

const columnHelper = createDataTableColumnHelper<PrivacyRequest>()
const limit = 15

const PrivacyRequestsPage = () => {
  const [selected, setSelected] = useState<PrivacyRequest | null>(null)
  const [status, setStatus] = useState<RequestStatus>("received")
  const [identityStatus, setIdentityStatus] =
    useState<IdentityStatus>("pending")
  const [notes, setNotes] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: limit,
  })
  const queryClient = useQueryClient()
  const offset = pagination.pageIndex * pagination.pageSize
  const queryKey = ["privacy-requests", offset, pagination.pageSize]
  const { data, isLoading } = useQuery<{
    privacy_requests: PrivacyRequest[]
    count: number
  }>({
    queryKey,
    queryFn: () =>
      sdk.client.fetch("/admin/privacy-requests", {
        query: {
          offset,
          limit: pagination.pageSize,
          order: "-created_at",
        },
      }),
  })
  const updateRequest = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/privacy-requests/${selected?.id}`, {
        method: "POST",
        body: {
          status,
          identity_status: identityStatus,
          internal_notes: notes || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-requests"] })
      toast.success("Privacy request updated")
      setSelected(null)
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to update the request"),
  })

  const openRequest = (request: PrivacyRequest) => {
    setSelected(request)
    setStatus(request.status)
    setIdentityStatus(request.identity_status)
    setNotes(request.internal_notes || "")
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor("reference", {
        header: "Reference",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Text size="small" weight="plus">
              {row.original.reference}
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {new Date(row.original.created_at).toLocaleDateString("en-GB")}
            </Text>
          </div>
        ),
      }),
      columnHelper.accessor("request_type", {
        header: "Request",
        cell: ({ row }) => requestLabels[row.original.request_type],
      }),
      columnHelper.accessor("name", {
        header: "Requester",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Text size="small">{row.original.name}</Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {row.original.email}
            </Text>
          </div>
        ),
      }),
      columnHelper.accessor("identity_status", {
        header: "Identity",
        cell: ({ row }) => (
          <StatusBadge
            color={
              row.original.identity_status === "verified"
                ? "green"
                : row.original.identity_status === "failed"
                ? "red"
                : "grey"
            }
          >
            {identityLabels[row.original.identity_status]}
          </StatusBadge>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            color={
              row.original.status === "completed"
                ? "green"
                : row.original.status === "rejected"
                ? "red"
                : row.original.status === "in_progress"
                ? "blue"
                : "grey"
            }
          >
            {statusLabels[row.original.status]}
          </StatusBadge>
        ),
      }),
      columnHelper.accessor("due_at", {
        header: "Due",
        cell: ({ row }) => {
          const due = new Date(row.original.due_at)
          const overdue =
            due.getTime() < Date.now() &&
            !["completed", "rejected"].includes(row.original.status)
          return (
            <Text size="small" className={overdue ? "text-ui-fg-error" : ""}>
              {due.toLocaleDateString("en-GB")}
            </Text>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <Button
            size="small"
            variant="secondary"
            onClick={() => openRequest(row.original)}
          >
            Review
          </Button>
        ),
      }),
    ],
    []
  )

  const table = useDataTable({
    columns,
    data: data?.privacy_requests || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  })

  return (
    <>
      <Container className="p-0">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
            <div>
              <Heading>Privacy requests</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Verify identity and complete requests by the displayed deadline.
              </Text>
            </div>
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>

      <Drawer
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{selected?.reference}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-5 overflow-auto p-6">
            <div>
              <Text size="small" weight="plus">
                {selected?.name}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {selected?.email}
                {selected?.phone ? ` · ${selected.phone}` : ""}
              </Text>
              {selected?.order_reference && (
                <Text size="small">
                  Order/reference: {selected.order_reference}
                </Text>
              )}
            </div>
            <div>
              <Text size="small" weight="plus">
                Request details
              </Text>
              <Text size="small" className="whitespace-pre-wrap">
                {selected?.details || "No additional details supplied."}
              </Text>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="privacy-request-identity">Identity check</Label>
              <Select
                value={identityStatus}
                onValueChange={(value) =>
                  setIdentityStatus(value as IdentityStatus)
                }
              >
                <Select.Trigger id="privacy-request-identity">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {Object.entries(identityLabels).map(([value, label]) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="privacy-request-status">Case status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as RequestStatus)}
              >
                <Select.Trigger id="privacy-request-status">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="privacy-request-notes">Internal notes</Label>
              <Textarea
                id="privacy-request-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={8}
              />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-2">
              <Drawer.Close asChild>
                <Button variant="secondary" size="small">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                onClick={() => updateRequest.mutate()}
                isLoading={updateRequest.isPending}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Privacy requests",
  icon: DocumentText,
})

export default PrivacyRequestsPage
