'use client'

import { useEffect } from 'react'
import { XIcon, CheckIcon, ClockIcon, AlertCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FeaturedCycleMember } from '@/lib/mock-data'

function formatCurrency(n: number) {
  return `₦${n.toLocaleString()}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  )
}

const memberStatusConfig = {
  approved: { icon: CheckIcon,        label: 'Approved', className: 'text-success' },
  pending:  { icon: ClockIcon,        label: 'Pending',  className: 'text-muted-foreground' },
  overdue:  { icon: AlertCircleIcon,  label: 'Overdue',  className: 'text-overdue' },
} as const

export type CycleDrawerCycle = {
  cycleId: string
  cycleStatus: 'active' | 'upcoming'
  groupName: string
  cycleNumber: number
  totalCycles: number
  recipientName: string
  dueDate: string
  contributionsReceived: number
  totalContributions: number
  amountReceived: number
  totalAmount: number
  members: FeaturedCycleMember[]
}

export default function CycleDrawer({
  cycle,
  open,
  onClose,
}: {
  cycle: CycleDrawerCycle | null
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!cycle) return null

  const progressPct = Math.round(
    (cycle.contributionsReceived / cycle.totalContributions) * 100
  )

  const approvedCount = cycle.members.filter((m) => m.status === 'approved').length
  const pendingCount  = cycle.members.filter((m) => m.status === 'pending').length
  const overdueCount  = cycle.members.filter((m) => m.status === 'overdue').length

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl',
          'sm:w-[420px] transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate">{cycle.groupName}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cycle {cycle.cycleNumber} of {cycle.totalCycles}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  cycle.cycleStatus === 'active'
                    ? 'bg-success/10 text-success'
                    : 'bg-info/10 text-info'
                )}
              >
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    cycle.cycleStatus === 'active' ? 'bg-success' : 'bg-info'
                  )}
                />
                {cycle.cycleStatus === 'active' ? 'Active' : 'Upcoming'}
              </span>
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>

          {/* Stat pills */}
          <div className="mt-4 flex gap-2">
            <StatPill label="Per member" value={formatCurrency(cycle.totalAmount / cycle.totalContributions)} />
            <StatPill label="Collected" value={formatCurrency(cycle.amountReceived)} />
            <StatPill label="Due date" value={formatDate(cycle.dueDate)} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Recipient */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Recipient
            </h3>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="size-9 shrink-0 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">
                  {getInitials(cycle.recipientName)}
                </span>
              </div>
              <span className="text-sm font-medium">{cycle.recipientName}</span>
              <span className="ml-auto text-sm font-semibold">{formatCurrency(cycle.totalAmount)}</span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Contribution progress
            </h3>
            <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {cycle.contributionsReceived} of {cycle.totalContributions} received
                </span>
                <span className="font-medium">{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{approvedCount} approved</span>
                <span>{pendingCount} pending</span>
                {overdueCount > 0 && <span className="text-overdue">{overdueCount} overdue</span>}
              </div>
            </div>
          </div>

          {/* Member list */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Members
            </h3>
            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
              {cycle.members.map((member) => {
                const { icon: Icon, label, className } = memberStatusConfig[member.status]
                return (
                  <div key={member.id} className="flex items-center gap-3 px-4 py-3 bg-card">
                    <div className="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">
                      {member.name}
                      {member.isCurrentUser && (
                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(member.amount)}
                    </span>
                    <span className={cn('flex items-center gap-1 text-xs font-medium', className)}>
                      <Icon className="size-3.5" />
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
