import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import Hero from "."

const meta = {
  title: "Homepage/Hero",
  component: Hero,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/gb",
        params: { countryCode: "gb" },
      },
    },
  },
} satisfies Meta<typeof Hero>

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
}

export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
}
