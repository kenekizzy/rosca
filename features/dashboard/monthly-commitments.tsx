import type { Group } from '@/lib/mock-data'

function formatCurrency(n: number) {
  return `₦${n.toLocaleString()}`
}

export default function MonthlyCommitments({ groups, total }: { groups: Group[]; total: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-sm">Monthly Commitments</h3>
      <p className="text-xs text-muted-foreground mt-0.5">What you contribute to active groups</p>

      <div className="mt-4 space-y-4">
        {groups.map((group) => {
          const pct = group.totalCycles > 0
            ? Math.round((group.currentCycle / group.totalCycles) * 100)
            : 0
          return (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm">{group.name}</span>
                <span className="text-sm font-medium">{formatCurrency(group.contributionAmount)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total monthly commitment</span>
        <span className="text-base font-semibold">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
