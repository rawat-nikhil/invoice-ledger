import { createElement, type ComponentType, type ReactNode } from "react"

import { Badge, Button, Input } from "@/components/atoms"
import {
  DeleteInvoiceButton,
  InvoiceStatusBadge,
  MarkAsPaidButton,
  PrimaryCTA,
  SecondaryCTA,
} from "@/components/molecules"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type ComponentPreview = {
  label?: string
  props?: Record<string, unknown>
}

export type RegistryEntry = {
  name: string
  description: string
  component?: ComponentType<Record<string, unknown>>
  previews?: ComponentPreview[]
  render?: () => ReactNode
}

export type ComponentRegistry = {
  atoms: RegistryEntry[]
  molecules: RegistryEntry[]
}

function CardPreview() {
  return createElement(
    Card,
    { className: "w-full max-w-xs" },
    createElement(
      CardHeader,
      null,
      createElement(CardTitle, null, "Card title")
    ),
    createElement(CardContent, null, "Content area for grouped UI.")
  )
}

export const componentRegistry: ComponentRegistry = {
  atoms: [
    {
      name: "Button",
      description: "Base button component with visual variants",
      component: Button as ComponentType<Record<string, unknown>>,
      previews: [
        { label: "Default", props: { children: "Button", variant: "default" } },
        {
          label: "Secondary",
          props: { children: "Button", variant: "secondary" },
        },
        { label: "Ghost", props: { children: "Button", variant: "ghost" } },
        { label: "Outline", props: { children: "Button", variant: "outline" } },
        {
          label: "Destructive",
          props: { children: "Button", variant: "destructive" },
        },
        { label: "Success", props: { children: "Button", variant: "success" } },
        { label: "Small", props: { children: "Button", size: "sm" } },
        { label: "Large", props: { children: "Button", size: "lg" } },
      ],
    },
    {
      name: "Input",
      description: "Standard form input field",
      component: Input as ComponentType<Record<string, unknown>>,
      previews: [
        {
          label: "Default",
          props: { placeholder: "Enter text...", type: "text" },
        },
        {
          label: "Error",
          props: {
            placeholder: "Invalid value",
            error: true,
            defaultValue: "bad@",
          },
        },
        {
          label: "Disabled",
          props: { placeholder: "Disabled", disabled: true },
        },
      ],
    },
    {
      name: "Badge",
      description: "Status label with semantic color variants",
      component: Badge as ComponentType<Record<string, unknown>>,
      previews: [
        { label: "Default", props: { children: "Default" } },
        { label: "Success", props: { children: "Success", variant: "success" } },
        { label: "Warning", props: { children: "Warning", variant: "warning" } },
        {
          label: "Destructive",
          props: { children: "Destructive", variant: "destructive" },
        },
      ],
    },
    {
      name: "Card",
      description: "Container for grouped content and actions",
      render: CardPreview,
    },
  ],
  molecules: [
    {
      name: "PrimaryCTA",
      description: "Main call-to-action button",
      component: PrimaryCTA as ComponentType<Record<string, unknown>>,
      previews: [{ props: { children: "Save Invoice" } }],
    },
    {
      name: "SecondaryCTA",
      description: "Secondary action button",
      component: SecondaryCTA as ComponentType<Record<string, unknown>>,
      previews: [{ props: { children: "Cancel" } }],
    },
    {
      name: "MarkAsPaidButton",
      description: "Marks invoice as paid",
      component: MarkAsPaidButton as ComponentType<Record<string, unknown>>,
      previews: [{ props: {} }],
    },
    {
      name: "DeleteInvoiceButton",
      description: "Deletes an invoice with destructive styling",
      component: DeleteInvoiceButton as ComponentType<Record<string, unknown>>,
      previews: [{ props: {} }],
    },
    {
      name: "InvoiceStatusBadge",
      description: "Maps invoice status to a semantic badge",
      component: InvoiceStatusBadge as ComponentType<Record<string, unknown>>,
      previews: [
        { label: "Draft", props: { status: "draft" } },
        { label: "Sent", props: { status: "sent" } },
        { label: "Paid", props: { status: "paid" } },
        { label: "Overdue", props: { status: "overdue" } },
      ],
    },
  ],
}
