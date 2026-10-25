import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import BrandSignature from "."

const meta = {
  title: "Foundation/Brand signature",
  component: BrandSignature,
  decorators: [
    (Story) => (
      <div className="sg-storybook-signature">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrandSignature>

export default meta
type Story = StoryObj<typeof meta>

export const Header: Story = { args: { context: "header", tone: "light" } }
export const MobileHeader: Story = {
  args: { context: "header", mobile: true, tone: "light" },
}
export const Footer: Story = { args: { context: "footer", tone: "dark" } }
