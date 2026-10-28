import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import BrandButton, {
  BrandButtonProps,
  BrandButtonSize,
  BrandButtonState,
  BrandButtonVariant,
} from "."

const variants: Array<{
  name: string
  type: BrandButtonVariant
  states: BrandButtonState[]
}> = [
  { name: "Primary", type: "primary", states: ["default", "hover", "active"] },
  {
    name: "Secondary",
    type: "secondary",
    states: ["default", "hover", "selected", "active"],
  },
  {
    name: "Tertiary",
    type: "tertiary",
    states: ["default", "hover", "selected", "active"],
  },
  {
    name: "Pagination",
    type: "pagination",
    states: ["default", "hover", "active"],
  },
  {
    name: "Icon Only",
    type: "icon-only",
    states: ["default", "hover", "selected", "active"],
  },
  {
    name: "Icon Labelled",
    type: "icon-labelled",
    states: ["default", "hover", "selected", "active"],
  },
  { name: "Social", type: "social", states: ["default", "hover", "active"] },
]

const ButtonMatrix = ({ size }: { size: BrandButtonSize }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "110px repeat(4, minmax(90px, max-content))",
      alignItems: "center",
      gap: "20px 36px",
    }}
  >
    <span />
    {(["default", "hover", "selected", "active"] as const).map((state) => (
      <strong key={state} style={{ textTransform: "capitalize" }}>
        {state}
      </strong>
    ))}
    {variants
      .filter(({ type }) =>
        size === "small"
          ? ["primary", "secondary", "tertiary", "pagination", "social"].includes(type)
          : true
      )
      .map(({ name, type, states }) => (
        <div key={type} style={{ display: "contents" }}>
          <strong>{name}</strong>
          {(["default", "hover", "selected", "active"] as const).map(
            (state) => (
              <div key={state}>
                {states.includes(state) && (
                  <BrandButton
                    variant={type}
                    size={size}
                    state={state}
                    aria-label={`${name} ${state}`}
                  >
                    Label
                  </BrandButton>
                )}
              </div>
            )
          )}
        </div>
      ))}
  </div>
)

const meta: Meta<BrandButtonProps> = {
  title: "Foundation/Button",
  component: BrandButton,
  args: {
    children: "Label",
    size: "default",
    state: "default",
    variant: "primary",
  },
  argTypes: {
    size: { control: "select", options: ["default", "small"] },
    state: {
      control: "select",
      options: ["default", "hover", "selected", "active"],
    },
    variant: {
      control: "select",
      options: variants.map(({ type }) => type),
    },
  },
  decorators: [
    (Story) => (
      <div className="sg-storybook-pad">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<BrandButtonProps>

export const Playground: Story = {}

export const DefaultSize: Story = {
  render: () => <ButtonMatrix size="default" />,
}

export const SmallSize: Story = {
  render: () => <ButtonMatrix size="small" />,
}

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <BrandButton variant="primary" showLeadingIcon>
        Label
      </BrandButton>
      <BrandButton variant="secondary" showTrailingIcon>
        Label
      </BrandButton>
      <BrandButton variant="tertiary" showLeadingIcon showTrailingIcon>
        Label
      </BrandButton>
    </div>
  ),
}
