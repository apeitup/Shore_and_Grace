import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  StatusBadge,
  Text,
  Textarea,
  toast,
  useDataTable,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { formatContactReplySubject } from "../../lib/contact-enquiry";
import { sdk } from "../../lib/sdk";

type EnquiryStatus = "new" | "in_progress" | "resolved" | "spam";

type ContactEnquiry = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone?: string | null;
  order_reference?: string | null;
  category: string;
  message: string;
  status: EnquiryStatus;
  internal_notes?: string | null;
  resolved_at?: string | null;
  retained_until: string;
  created_at: string;
};

type ContactEnquiryMessage = {
  id: string;
  direction: "inbound" | "outbound";
  subject: string;
  body: string;
  recipient_email: string;
  sender_email: string;
  sent_at: string;
};

const statusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
  spam: "Spam",
};

const categoryLabels: Record<string, string> = {
  order: "Order",
  delivery: "Delivery",
  returns: "Returns",
  products: "Products",
  services: "Services",
  privacy: "Privacy",
  other: "Other",
};

const statusColors: Record<EnquiryStatus, "blue" | "green" | "grey" | "red"> = {
  new: "blue",
  in_progress: "grey",
  resolved: "green",
  spam: "red",
};

const columnHelper = createDataTableColumnHelper<ContactEnquiry>();
const limit = 15;

const ContactEnquiriesPage = () => {
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);
  const [status, setStatus] = useState<EnquiryStatus>("new");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: limit,
  });
  const queryClient = useQueryClient();
  const offset = pagination.pageIndex * pagination.pageSize;
  const queryKey = [
    "contact-enquiries",
    offset,
    pagination.pageSize,
    search,
    statusFilter,
  ];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading } = useQuery<{
    contact_enquiries: ContactEnquiry[];
    count: number;
  }>({
    queryKey,
    queryFn: () =>
      sdk.client.fetch("/admin/contact-enquiries", {
        query: {
          offset,
          limit: pagination.pageSize,
          order: "-created_at",
          q: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      }),
  });

  const updateEnquiry = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/contact-enquiries/${selected?.id}`, {
        method: "POST",
        body: {
          status,
          internal_notes: notes || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-enquiries"] });
      toast.success("Contact enquiry updated");
      setSelected(null);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to update the enquiry"),
  });

  const { data: conversation, isLoading: isConversationLoading } = useQuery<{
    messages: ContactEnquiryMessage[];
  }>({
    queryKey: ["contact-enquiry-messages", selected?.id],
    queryFn: () =>
      sdk.client.fetch(
        `/admin/contact-enquiries/${selected?.id}/messages`,
      ),
    enabled: Boolean(selected?.id),
  });

  const sendReply = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/contact-enquiries/${selected?.id}/replies`, {
        method: "POST",
        body: {
          request_id: crypto.randomUUID(),
          subject: replySubject.trim(),
          message: replyMessage.trim(),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contact-enquiry-messages", selected?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["contact-enquiries"] });
      if (status === "new") {
        setStatus("in_progress");
        setSelected((current) =>
          current ? { ...current, status: "in_progress" } : current,
        );
      }
      setReplyMessage("");
      setReplyOpen(false);
      toast.success("Reply sent");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to send the reply"),
  });

  const openEnquiry = (enquiry: ContactEnquiry) => {
    setSelected(enquiry);
    setStatus(enquiry.status);
    setNotes(enquiry.internal_notes || "");
    setReplySubject(formatContactReplySubject(enquiry.message));
    setReplyMessage("");
    setReplyOpen(false);
  };

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
      columnHelper.accessor("name", {
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Text size="small">{row.original.name}</Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {row.original.email}
            </Text>
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: ({ row }) =>
          categoryLabels[row.original.category] || row.original.category,
      }),
      columnHelper.accessor("order_reference", {
        header: "Order/reference",
        cell: ({ row }) => row.original.order_reference || "—",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge color={statusColors[row.original.status]}>
            {statusLabels[row.original.status]}
          </StatusBadge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <Button
            size="small"
            variant="secondary"
            onClick={() => openEnquiry(row.original)}
          >
            Review
          </Button>
        ),
      }),
    ],
    [],
  );

  const table = useDataTable({
    columns,
    data: data?.contact_enquiries || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  });

  return (
    <>
      <Container className="p-0">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div>
              <Heading>Contact enquiries</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Review customer messages and keep their progress up to date.
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Input
                aria-label="Search contact enquiries"
                placeholder="Search enquiries"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-[240px]"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
              >
                <Select.Trigger
                  aria-label="Filter by status"
                  className="w-[150px]"
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
            <div className="flex flex-col gap-3">
              <Text size="small" weight="plus">
                Conversation
              </Text>
              <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
                <div className="flex items-center justify-between gap-3">
                  <Text size="small" weight="plus">
                    {selected?.name}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {selected?.created_at
                      ? new Date(selected.created_at).toLocaleString("en-GB")
                      : ""}
                  </Text>
                </div>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {selected
                  ? categoryLabels[selected.category] || selected.category
                  : "Enquiry"}
                </Text>
                <Text size="small" className="mt-2 whitespace-pre-wrap">
                  {selected?.message}
                </Text>
              </div>
              {isConversationLoading && (
                <Text size="small" className="text-ui-fg-subtle">
                  Loading replies…
                </Text>
              )}
              {conversation?.messages.map((message) => (
                <div
                  key={message.id}
                  className="ml-6 rounded-lg border border-ui-border-base bg-ui-bg-base p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Text size="small" weight="plus">
                        Shore &amp; Grace
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {message.subject}
                      </Text>
                    </div>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {new Date(message.sent_at).toLocaleString("en-GB")}
                    </Text>
                  </div>
                  <Text size="small" className="mt-2 whitespace-pre-wrap">
                    {message.body}
                  </Text>
                </div>
              ))}
            </div>
            {!replyOpen ? (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setReplyOpen(true)}
              >
                Reply
              </Button>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-ui-border-base p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-reply-subject">Subject</Label>
                  <Input
                    id="contact-reply-subject"
                    value={replySubject}
                    onChange={(event) => setReplySubject(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-reply-message">Message</Label>
                  <Textarea
                    id="contact-reply-message"
                    value={replyMessage}
                    onChange={(event) => setReplyMessage(event.target.value)}
                    rows={8}
                    autoFocus
                  />
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle"
                  >
                    Write only the reply itself. The customer’s first name and
                    the Shore &amp; Grace sign-off are added automatically by
                    the email template.
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Sent to {selected?.email}. Customer replies will go to the
                    Shore &amp; Grace contact inbox.
                  </Text>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setReplyOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    onClick={() => sendReply.mutate()}
                    isLoading={sendReply.isPending}
                    disabled={!replySubject.trim() || !replyMessage.trim()}
                  >
                    Send reply
                  </Button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-enquiry-status">Case status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as EnquiryStatus)}
              >
                <Select.Trigger id="contact-enquiry-status">
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
              <Label htmlFor="contact-enquiry-notes">Internal notes</Label>
              <Textarea
                id="contact-enquiry-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={8}
              />
            </div>
            {selected?.retained_until && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                Scheduled for deletion after{" "}
                {new Date(selected.retained_until).toLocaleDateString("en-GB")}.
              </Text>
            )}
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
                onClick={() => updateEnquiry.mutate()}
                isLoading={updateEnquiry.isPending}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  );
};

export const config = defineRouteConfig({
  label: "Contact enquiries",
  icon: ChatBubbleLeftRight,
});

export default ContactEnquiriesPage;
