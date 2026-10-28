import { Heart, HeartSolid } from "iconoir-react"
import clsx from "clsx"

type WishlistHeartProps = {
  saved: boolean
  size?: number
  className?: string
}

const WishlistHeart = ({
  saved,
  size = 18,
  className,
}: WishlistHeartProps) => {
  const Icon = saved ? HeartSolid : Heart

  return (
    <Icon
      aria-hidden="true"
      className={clsx("sg-wishlist-heart", saved && "is-saved", className)}
      width={size}
      height={size}
      strokeWidth={1.5}
    />
  )
}

export default WishlistHeart
