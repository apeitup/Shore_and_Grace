import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Calendar } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  StatusBadge,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { FormEvent } from "react"
import { sdk } from "../../lib/sdk"

type DeliveryZone = {
  id: string
  name: string
  fulfillment_type: "delivery" | "collection"
  postcode_patterns: { values?: string[] }
  fee: number
  currency_code: string
  minimum_lead_days: number
  daily_capacity: number
  delivery_window?: string | null
  active: boolean
}

type BlockedDate = {
  id: string
  date: string
  fulfillment_type: "delivery" | "collection" | "all"
  reason?: string | null
}

const DeliveryPage = () => {
  const { data, isLoading, refetch } = useQuery<{
    zones: DeliveryZone[]
    blocked_dates: BlockedDate[]
  }>({
    queryKey: ["florist-delivery"],
    queryFn: () => sdk.client.fetch("/admin/florist-delivery"),
  })
  const createZone = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch("/admin/florist-delivery", { method: "POST", body }),
    onSuccess: () => {
      toast.success("Delivery zone created")
      refetch()
    },
    onError: () => toast.error("Unable to create delivery zone"),
  })
  const createBlockedDate = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch("/admin/florist-delivery/blocked-dates", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      toast.success("Date blocked")
      refetch()
    },
    onError: () => toast.error("Unable to block the date"),
  })

  const handleZoneSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const patterns = String(form.get("postcode_patterns") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)

    createZone.mutate({
      name: String(form.get("name") || ""),
      fulfillment_type: String(form.get("fulfillment_type") || "delivery"),
      postcode_patterns: patterns,
      shipping_option_id: String(form.get("shipping_option_id") || "") || null,
      currency_code: "gbp",
      fee: Number(form.get("fee") || 0),
      minimum_lead_days: Number(form.get("minimum_lead_days") || 1),
      same_day_cutoff: String(form.get("same_day_cutoff") || "") || null,
      daily_capacity: Number(form.get("daily_capacity") || 20),
      allowed_weekdays: [1, 2, 3, 4, 5, 6],
      delivery_window: String(form.get("delivery_window") || "") || null,
      active: true,
    })
  }

  const handleBlockedDateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    createBlockedDate.mutate({
      date: String(form.get("date") || ""),
      fulfillment_type: String(form.get("fulfillment_type") || "all"),
      reason: String(form.get("reason") || "") || null,
    })
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading>Florist delivery</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Configure postcode coverage, lead times, capacity, delivery windows,
            fees and collection options.
          </Text>
        </div>
        <form
          onSubmit={handleZoneSubmit}
          className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-2"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Zone name</Label>
            <Input id="name" name="name" placeholder="Local delivery" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fulfillment_type">Type</Label>
            <Select name="fulfillment_type" defaultValue="delivery">
              <Select.Trigger id="fulfillment_type">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="delivery">Delivery</Select.Item>
                <Select.Item value="collection">Collection</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="postcode_patterns">Postcode prefixes</Label>
            <Input
              id="postcode_patterns"
              name="postcode_patterns"
              placeholder="CO1, CO2, CO3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="shipping_option_id">Medusa shipping option ID</Label>
            <Input
              id="shipping_option_id"
              name="shipping_option_id"
              placeholder="so_..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fee">Zone fee (GBP reference)</Label>
            <Input id="fee" name="fee" type="number" min="0" step="0.01" defaultValue="0" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="daily_capacity">Daily capacity</Label>
            <Input id="daily_capacity" name="daily_capacity" type="number" min="1" defaultValue="20" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="minimum_lead_days">Minimum lead days</Label>
            <Input id="minimum_lead_days" name="minimum_lead_days" type="number" min="0" defaultValue="1" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="same_day_cutoff">Same-day cut-off</Label>
            <Input id="same_day_cutoff" name="same_day_cutoff" type="time" />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="delivery_window">Delivery or collection window</Label>
            <Input id="delivery_window" name="delivery_window" placeholder="09:00–17:00" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" isLoading={createZone.isPending}>Create zone</Button>
          </div>
        </form>
      </Container>

      <Container className="p-0">
        <div className="border-b px-6 py-4"><Heading level="h2">Active zones</Heading></div>
        <div className="divide-y">
          {isLoading && <Text className="px-6 py-4">Loading…</Text>}
          {data?.zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <Text weight="plus">{zone.name}</Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {zone.fulfillment_type === "delivery"
                    ? (zone.postcode_patterns.values || []).join(", ") || "No postcode prefixes"
                    : "Studio collection"}
                  {` · ${zone.daily_capacity} orders/day · ${zone.minimum_lead_days} day lead`}
                </Text>
              </div>
              <StatusBadge color={zone.active ? "green" : "grey"}>
                {zone.active ? "Active" : "Inactive"}
              </StatusBadge>
            </div>
          ))}
          {!isLoading && !data?.zones.length && (
            <Text className="px-6 py-4 text-ui-fg-subtle">No delivery zones configured yet.</Text>
          )}
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4"><Heading level="h2">Blocked dates</Heading></div>
        <form onSubmit={handleBlockedDateSubmit} className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-4">
          <Input name="date" type="date" required />
          <Select name="fulfillment_type" defaultValue="all">
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All fulfilment</Select.Item>
              <Select.Item value="delivery">Delivery only</Select.Item>
              <Select.Item value="collection">Collection only</Select.Item>
            </Select.Content>
          </Select>
          <Input name="reason" placeholder="Reason (optional)" />
          <Button type="submit" isLoading={createBlockedDate.isPending}>Block date</Button>
        </form>
        <div className="divide-y">
          {data?.blocked_dates.map((item) => (
            <div key={item.id} className="flex justify-between px-6 py-3">
              <Text>{item.date}</Text>
              <Text size="small" className="text-ui-fg-subtle">
                {item.fulfillment_type}{item.reason ? ` · ${item.reason}` : ""}
              </Text>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Florist delivery",
  icon: Calendar,
})

export default DeliveryPage
