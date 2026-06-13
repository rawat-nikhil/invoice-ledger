import { createElement } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { RegistryEntry } from "@/lib/component-registry"

type ComponentPreviewCardProps = {
  entry: RegistryEntry
}

function ComponentPreviewCard({ entry }: ComponentPreviewCardProps) {
  const previews = entry.previews ?? [{ props: {} }]

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle>{entry.name}</CardTitle>
        <CardDescription>{entry.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {entry.render ? (
          <div className="flex items-center">{entry.render()}</div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            {previews.map((preview, index) => (
              <div
                key={preview.label ?? `${entry.name}-${index}`}
                className="flex flex-col items-start gap-2"
              >
                {preview.label ? (
                  <span className="text-xs font-medium text-muted-foreground">
                    {preview.label}
                  </span>
                ) : null}
                <div className="flex items-center">
                  {entry.component
                    ? createElement(entry.component, preview.props ?? {})
                    : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ComponentPreviewCard }
