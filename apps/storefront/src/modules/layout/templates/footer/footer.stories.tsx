import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import Footer from "."

const meta = {
  title: "Foundation/Site footer",
  component: Footer,
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
}

export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
}
