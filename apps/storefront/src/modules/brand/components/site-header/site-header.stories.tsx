import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import SiteHeader from "."

const meta = {
  title: "Foundation/Site header",
  component: SiteHeader,
} satisfies Meta<typeof SiteHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
}

export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
}
