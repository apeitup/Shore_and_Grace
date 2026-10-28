import { Text, clx } from "@modules/common/components/ui"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import Image from "next/image"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize: _headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable: _triggerable,
  ...props
}) => {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={clx(
        "sg-product-accordion__item group",
        className
      )}
    >
      <AccordionPrimitive.Header className="sg-product-accordion__header">
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <Text className="sg-product-accordion__title">{title}</Text>
            </div>
            <AccordionPrimitive.Trigger className="sg-product-accordion__trigger">
              {customTrigger || <MorphingTrigger />}
            </AccordionPrimitive.Trigger>
          </div>
          {subtitle && (
            <Text as="span" className="mt-1 text-sm">
              {subtitle}
            </Text>
          )}
        </div>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "sg-product-accordion__content radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open radix-state-closed:pointer-events-none"
        )}
      >
        <div className="sg-product-accordion__inner group-radix-state-closed:animate-accordion-close">
          {description && <Text>{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div className="sg-product-accordion__icon">
      <Image
        src="/assets/shop/nav-arrow-down.svg"
        alt=""
        width={24}
        height={24}
      />
    </div>
  )
}

export default Accordion
