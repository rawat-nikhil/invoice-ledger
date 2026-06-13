import { ComponentPreviewCard } from "@/components/component-docs/component-preview-card"
import type { RegistryEntry } from "@/lib/component-registry"

type ComponentSectionProps = {
  title: string
  description: string
  entries: RegistryEntry[]
}

function ComponentSection({
  title,
  description,
  entries,
}: ComponentSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <ComponentPreviewCard key={entry.name} entry={entry} />
        ))}
      </div>
    </section>
  )
}

export { ComponentSection }
