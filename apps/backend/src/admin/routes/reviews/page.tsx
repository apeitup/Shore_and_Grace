import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import {
  Container,
  createDataTableColumnHelper,
  createDataTableCommandHelper,
  DataTable,
  DataTablePaginationState,
  DataTableRowSelectionState,
  Heading,
  StatusBadge,
  toast,
  useDataTable,
} from "@medusajs/ui"
import { HttpTypes } from "@medusajs/framework/types"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"

type Review = {
  id: string
  content: string
  rating: number
  name: string
  email: string
  product_id: string
  customer_id?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  product?: HttpTypes.AdminProduct
}

const columnHelper = createDataTableColumnHelper<Review>()

const columns = [
  columnHelper.select(),
  columnHelper.accessor("name", {
    header: "Reviewer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.name}</span>
        <span className="text-ui-fg-subtle text-xs">{row.original.email}</span>
      </div>
    ),
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    cell: ({ row }) => `${row.original.rating} / 5`,
  }),
  columnHelper.accessor("content", {
    header: "Review",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-[420px]">{row.original.content}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => {
      const color =
        row.original.status === "approved"
          ? "green"
          : row.original.status === "rejected"
          ? "red"
          : "grey"

      return (
        <StatusBadge color={color}>
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </StatusBadge>
      )
    },
  }),
  columnHelper.accessor("product", {
    header: "Product",
    cell: ({ row }) => (
      <Link className="text-ui-fg-interactive" to={`/products/${row.original.product_id}`}>
        {row.original.product?.title || row.original.product_id}
      </Link>
    ),
  }),
]

const commandHelper = createDataTableCommandHelper()

const useCommands = (refetch: () => void) => [
  commandHelper.command({
    label: "Approve",
    shortcut: "A",
    action: async (selection) => {
      await sdk.client
        .fetch("/admin/reviews/status", {
          method: "POST",
          body: { ids: Object.keys(selection), status: "approved" },
        })
        .then(() => {
          toast.success("Reviews approved")
          refetch()
        })
        .catch(() => toast.error("Failed to approve reviews"))
    },
  }),
  commandHelper.command({
    label: "Reject",
    shortcut: "R",
    action: async (selection) => {
      await sdk.client
        .fetch("/admin/reviews/status", {
          method: "POST",
          body: { ids: Object.keys(selection), status: "rejected" },
        })
        .then(() => {
          toast.success("Reviews rejected")
          refetch()
        })
        .catch(() => toast.error("Failed to reject reviews"))
    },
  }),
]

const limit = 15

const ReviewsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })
  const [rowSelection, setRowSelection] =
    useState<DataTableRowSelectionState>({})
  const offset = useMemo(
    () => pagination.pageIndex * pagination.pageSize,
    [pagination]
  )
  const { data, isLoading, refetch } = useQuery<{
    reviews: Review[]
    count: number
  }>({
    queryKey: ["reviews", offset, pagination.pageSize],
    queryFn: () =>
      sdk.client.fetch("/admin/reviews", {
        query: {
          offset,
          limit: pagination.pageSize,
          order: "-created_at",
        },
      }),
  })
  const table = useDataTable({
    columns,
    data: data?.reviews || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    commands: useCommands(refetch),
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
    },
    getRowId: (row) => row.id,
  })

  return (
    <Container className="p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
          <Heading>Product reviews</Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
        <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />
      </DataTable>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Reviews",
  icon: ChatBubbleLeftRight,
})

export default ReviewsPage
