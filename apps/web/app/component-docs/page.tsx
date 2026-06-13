import type { Metadata } from "next"

import { ComponentSection } from "@/components/component-docs/component-section"
import { componentRegistry } from "@/lib/component-registry"

export const metadata: Metadata = {
  title: "Component Docs | Invoice Ledger",
  description: "Internal design system documentation for UI components",
}

export default function ComponentDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-12 px-6 py-10 md:px-8 md:py-12">
        <header className="space-y-2 border-b border-border pb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Internal · Design System
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Component Documentation
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Live previews of atoms and molecules used across the invoice ledger
            application. Use this page to verify visual consistency and reuse
            patterns during development.
          </p>
        </header>

        <ComponentSection
          title="Atoms"
          description="Visual primitives — styling and layout only, no business meaning."
          entries={componentRegistry.atoms}
        />

        <ComponentSection
          title="Molecules"
          description="Business-level components composed from atoms."
          entries={componentRegistry.molecules}
        />
      </div>
    </div>
  )
}
