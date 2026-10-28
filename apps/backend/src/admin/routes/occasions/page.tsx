import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Calendar, Plus, Trash } from "@medusajs/icons"
import {
  Button,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, useState } from "react"
import { sdk } from "../../lib/sdk"

type DateType =
  | "fixed"
  | "easter"
  | "mothering_sunday"
  | "fathers_day"

type SystemOccasion = {
  id: string
  name: string
  slug: string
  date_type: DateType
  month?: number | null
  day?: number | null
  default_reminder_days: number
  enabled_by_default: boolean
  active: boolean
  description?: string | null
}

const dateTypeLabels: Record<DateType, string> = {
  fixed: "Fixed date",
  easter: "Easter Sunday",
  mothering_sunday: "Mothering Sunday",
  fathers_day: "Father's Day",
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const OccasionsPage = () => {
  const [createOpen, setCreateOpen] = useState(false)
  const [dateType, setDateType] = useState<DateType>("fixed")
  const [occasionName, setOccasionName] = useState("")
  const [occasionSlug, setOccasionSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [createError, setCreateError] = useState("")
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  const queryKey = ["system-occasions"]
  const { data, isLoading } = useQuery<{ occasions: SystemOccasion[] }>({
    queryKey,
    queryFn: () => sdk.client.fetch("/admin/occasions"),
  })
  const createOccasion = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch("/admin/occasions", { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success("System occasion created")
      setCreateOpen(false)
      setOccasionName("")
      setOccasionSlug("")
      setSlugEdited(false)
      setCreateError("")
    },
    onError: (error: Error) => {
      const message = error.message || "Unable to create the occasion"
      setCreateError(message)
      toast.error(message)
    },
  })
  const updateOccasion = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      sdk.client.fetch(`/admin/occasions/${id}`, { method: "POST", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error: Error) =>
      toast.error(error.message || "Unable to update the occasion"),
  })
  const deleteOccasion = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/occasions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success("System occasion removed")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to remove the occasion"),
  })

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const month = dateType === "fixed" ? Number(form.get("month")) : null
    const day = dateType === "fixed" ? Number(form.get("day")) : null
    const slug = occasionSlug || slugify(occasionName)

    if (!occasionName.trim() || !slug) {
      setCreateError("Enter an occasion name.")
      return
    }
    if (dateType === "fixed" && (!month || !day)) {
      setCreateError("Choose a valid month and day.")
      return
    }

    setCreateError("")
    createOccasion.mutate({
      name: occasionName.trim(),
      slug,
      date_type: dateType,
      month,
      day,
      default_reminder_days: Number(form.get("default_reminder_days") || 14),
      enabled_by_default: form.get("enabled_by_default") === "on",
      active: true,
      description: String(form.get("description") || "") || null,
    })
  }

  const handleDelete = async (occasion: SystemOccasion) => {
    const confirmed = await prompt({
      title: `Delete ${occasion.name}?`,
      description:
        "It will disappear from customer accounts. Existing personal dates are unaffected.",
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (confirmed) {
      deleteOccasion.mutate(occasion.id)
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Special occasions</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Manage the dates customers can enable as reminders.
            </Text>
          </div>
          <Button size="small" onClick={() => setCreateOpen(true)}>
            <Plus /> Add occasion
          </Button>
        </div>
        <div className="divide-y">
          {isLoading && (
            <Text size="small" className="text-ui-fg-subtle px-6 py-4">
              Loading occasions…
            </Text>
          )}
          {data?.occasions.map((occasion) => (
            <div
              key={occasion.id}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div className="min-w-0">
                <Text size="small" leading="compact" weight="plus">
                  {occasion.name}
                </Text>
                <Text
                  size="small"
                  leading="compact"
                  className="text-ui-fg-subtle"
                >
                  {dateTypeLabels[occasion.date_type]}
                  {occasion.date_type === "fixed"
                    ? ` · ${occasion.day}/${occasion.month}`
                    : ""}
                  {` · Reminder ${occasion.default_reminder_days} days before`}
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <Text size="small" className="text-ui-fg-subtle">
                  {occasion.active ? "Active" : "Inactive"}
                </Text>
                <Switch
                  checked={occasion.active}
                  onCheckedChange={(active) =>
                    updateOccasion.mutate({
                      id: occasion.id,
                      body: { active },
                    })
                  }
                  disabled={updateOccasion.isPending}
                />
                <Button
                  size="small"
                  variant="transparent"
                  onClick={() => handleDelete(occasion)}
                  disabled={deleteOccasion.isPending}
                >
                  <Trash />
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && !data?.occasions.length && (
            <Text size="small" className="text-ui-fg-subtle px-6 py-4">
              No system occasions have been added.
            </Text>
          )}
        </div>
      </Container>

      <FocusModal
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            setCreateError("")
          }
        }}
      >
        <FocusModal.Content>
          <form className="flex h-full flex-col" onSubmit={handleCreate}>
            <FocusModal.Header>
              <div className="mr-auto">
                <FocusModal.Title>Add occasion</FocusModal.Title>
                <FocusModal.Description>
                  Add a fixed date or a recurring calendar occasion.
                </FocusModal.Description>
              </div>
              <div className="flex items-center justify-end gap-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary">
                    Cancel
                  </Button>
                </FocusModal.Close>
                <Button
                  size="small"
                  type="submit"
                  isLoading={createOccasion.isPending}
                >
                  Save occasion
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-8">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="occasion-name">Name</Label>
                  <Input
                    id="occasion-name"
                    name="name"
                    value={occasionName}
                    onChange={(event) => {
                      const name = event.target.value
                      setOccasionName(name)
                      if (!slugEdited) {
                        setOccasionSlug(slugify(name))
                      }
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="occasion-slug">Slug</Label>
                  <Input
                    id="occasion-slug"
                    name="slug"
                    placeholder="valentines-day"
                    pattern="[a-z0-9-]+"
                    value={occasionSlug}
                    onChange={(event) => {
                      setSlugEdited(true)
                      setOccasionSlug(slugify(event.target.value))
                    }}
                    required
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    Generated automatically from the name. Used internally in
                    links and integrations.
                  </Text>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="occasion-date-type">Date rule</Label>
                  <Select
                    value={dateType}
                    onValueChange={(value) => setDateType(value as DateType)}
                  >
                    <Select.Trigger id="occasion-date-type">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {Object.entries(dateTypeLabels).map(([value, label]) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                {dateType === "fixed" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="occasion-month">Month</Label>
                      <Input
                        id="occasion-month"
                        name="month"
                        type="number"
                        min="1"
                        max="12"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="occasion-day">Day</Label>
                      <Input
                        id="occasion-day"
                        name="day"
                        type="number"
                        min="1"
                        max="31"
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="occasion-reminder">Default reminder days</Label>
                  <Input
                    id="occasion-reminder"
                    name="default_reminder_days"
                    type="number"
                    min="0"
                    max="365"
                    defaultValue="14"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="occasion-description">Description</Label>
                  <Input id="occasion-description" name="description" />
                </div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="enabled_by_default" />
                  <Text size="small">Enable reminders by default</Text>
                </label>
                {createError && (
                  <Text size="small" className="text-ui-fg-error">
                    {createError}
                  </Text>
                )}
              </div>
            </FocusModal.Body>
          </form>
        </FocusModal.Content>
      </FocusModal>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Special occasions",
  icon: Calendar,
})

export default OccasionsPage
