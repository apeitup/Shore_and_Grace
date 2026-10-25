import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import BrandButton from "."

const meta = {
  title: "Foundation/Button",
  component: BrandButton,
  args: {
    children: "Shop now",
  },
  decorators: [
    (Story) => (
      <div className="sg-storybook-pad">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrandButton>

export default meta
type Story = StoryObj<typeof meta>

export const Sage: Story = { args: { tone: "sage" } }
export const Ink: Story = { args: { tone: "ink" } }
export const Outline: Story = { args: { tone: "outline" } }
