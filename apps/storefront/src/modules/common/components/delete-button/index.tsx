import { deleteLineItem } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { RefreshDouble, Trash } from "iconoir-react"
import { clx } from "@modules/common/components/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
  icon,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  icon?: React.ReactNode
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id)
      .then(notifyCartUpdated)
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
