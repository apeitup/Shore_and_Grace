import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Gift } from "@medusajs/icons"
import { Container, Heading, StatusBadge, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

type GiftOrder = {
  id: string
  cart_id: string
  order_id?: string | null
  recipient_type: "self" | "other"
  recipient_first_name?: string | null
  recipient_last_name?: string | null
  recipient_phone?: string | null
  purchaser_first_name?: string | null
  purchaser_last_name?: string | null
  purchaser_email?: string | null
  gift_message?: string | null
  delivery_instructions?: string | null
  leave_safe: boolean
  hide_prices: boolean
  anonymous_sender: boolean
  created_at: string
}

const GiftOrdersPage = () => {
  const { data, isLoading } = useQuery<{ gift_orders: GiftOrder[] }>({
    queryKey: ["gift-orders"],
    queryFn: () => sdk.client.fetch("/admin/gift-orders"),
  })

  return (
    <Container className="p-0">
      <div className="border-b px-6 py-4">
        <Heading>Gift and recipient details</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Structured recipient, card message and delivery instructions captured
          during checkout.
        </Text>
      </div>
      <div className="divide-y">
        {isLoading && <Text className="px-6 py-4">Loading…</Text>}
        {data?.gift_orders.map((giftOrder) => (
          <div key={giftOrder.id} className="grid gap-4 px-6 py-4 md:grid-cols-4">
            <div>
              <Text size="small" className="text-ui-fg-subtle">Recipient</Text>
              <Text weight="plus">
                {[giftOrder.recipient_first_name, giftOrder.recipient_last_name]
                  .filter(Boolean)
                  .join(" ") || "Not supplied"}
              </Text>
              {giftOrder.recipient_phone && <Text size="small">{giftOrder.recipient_phone}</Text>}
            </div>
            <div>
              <Text size="small" className="text-ui-fg-subtle">Purchaser</Text>
              <Text>
                {[giftOrder.purchaser_first_name, giftOrder.purchaser_last_name]
                  .filter(Boolean)
                  .join(" ") || "Not supplied"}
              </Text>
              {giftOrder.purchaser_email && <Text size="small">{giftOrder.purchaser_email}</Text>}
            </div>
            <div>
              <Text size="small" className="text-ui-fg-subtle">Card and instructions</Text>
              <Text>{giftOrder.gift_message || "No card message"}</Text>
              {giftOrder.delivery_instructions && (
                <Text size="small" className="text-ui-fg-subtle">
                  {giftOrder.delivery_instructions}
                </Text>
              )}
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <StatusBadge color={giftOrder.hide_prices ? "green" : "grey"}>
                {giftOrder.hide_prices ? "Hide prices" : "Include prices"}
              </StatusBadge>
              {giftOrder.leave_safe && <StatusBadge color="orange">Safe place allowed</StatusBadge>}
              <Text size="xsmall" className="basis-full text-ui-fg-muted">
                {giftOrder.order_id || `Cart ${giftOrder.cart_id}`}
              </Text>
            </div>
          </div>
        ))}
        {!isLoading && !data?.gift_orders.length && (
          <Text className="px-6 py-4 text-ui-fg-subtle">No gift orders have been captured yet.</Text>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Gift orders",
  icon: Gift,
})

export default GiftOrdersPage
