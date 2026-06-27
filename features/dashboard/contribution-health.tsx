import type { ContributionHealth } from '@/lib/mock-data'

export default function ContributionHealthCard({ health }: { health: ContributionHealth }) {
  const total = health.onTime + health.late + health.penalties

  const rows = [
    { label: 'On-Time', value: health.onTime, colorBar: 'bg-success', colorText: 'text-success' },
    { label: 'Late', value: health.late, colorBar: 'bg-warning', colorText: 'text-warning' },
    { label: 'Penalties', value: health.penalties, colorBar: 'bg-danger', colorText: 'text-danger' },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-sm">Contribution Health</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Your payment performance</p>

      <div className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-4">
            <div className="w-20 shrink-0">
              <p className={`text-2xl font-semibold ${row.colorText}`}>{row.value}</p>
              <p className="text-[10px] text-muted-foreground">{row.label}</p>
            </div>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${row.colorBar}`}
                style={{ width: total > 0 ? `${(row.value / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Approval Rate</span>
        <span className="text-base font-semibold text-success">{health.approvalRate}%</span>
      </div>
    </div>
  )
}
