import { Text } from "@medusajs/ui"
import { NavLink } from "react-router-dom"

const items = [
  { label: "Subscribers", to: "/newsletter", end: true },
  { label: "Newsletters", to: "/newsletter/newsletters" },
  { label: "Templates", to: "/newsletter/templates" },
]

export const NewsletterNav = () => (
  <nav
    aria-label="Newsletter"
    className="flex flex-wrap gap-1 rounded-lg border border-ui-border-base bg-ui-bg-base p-1"
  >
    {items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `rounded-md px-3 py-2 transition-colors ${
            isActive
              ? "bg-ui-bg-subtle-hover text-ui-fg-base"
              : "text-ui-fg-subtle hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base"
          }`
        }
      >
        <Text size="small" weight="plus">
          {item.label}
        </Text>
      </NavLink>
    ))}
  </nav>
)
