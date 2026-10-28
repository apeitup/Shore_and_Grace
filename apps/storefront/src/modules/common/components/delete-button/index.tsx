import { deleteLineItem } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { RefreshDouble, Trash } from "iconoir-react"
import { clx } from "@modules/common/components/ui"
import { useState } from "react"
import { captureStorefrontEvent } from "@modules/analytics/lib/posthog-client"
import type { StorefrontEventProperties } from "@modules/analytics/lib/event-contract"

const DeleteButton = ({
  id,
  children,
  className,
  icon,
  analytics,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  icon?: React.ReactNode
  analytics?: StorefrontEventProperties["product_removed_from_cart"]
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id)
      .then(() => {
        notifyCartUpdated()
        if (analytics) {
          void captureStorefrontEvent("product_removed_from_cart", analytics)
        }
      })
      .catch((_err) => {
        setIsDeleting(false)
      })
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? <RefreshDouble className="animate-spin" /> : (icon ?? <Trash />)}
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
