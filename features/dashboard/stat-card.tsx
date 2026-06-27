import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
}

export default function StatCard({ title, value, subtitle, icon: Icon }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">{title}</p>
        <Icon className="size-4 text-muted-foreground shrink-0" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
