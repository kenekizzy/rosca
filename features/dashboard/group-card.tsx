'use client'

import { UsersIcon, CalendarIcon } from 'lucide-react'
import type { Group, GroupStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

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

const statusStyles: Record<GroupStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-success/10 text-success' },
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning' },
  completed: { label: 'Completed', className: 'bg-info/10 text-info' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
}

export default function GroupCard({
  group,
  onViewDetails,
}: {
  group: Group
  onViewDetails: (group: Group) => void
}) {
  const { label, className } = statusStyles[group.status]
  const cycleProgress =
    group.totalCycles > 0 ? Math.round((group.currentCycle / group.totalCycles) * 100) : 0

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{group.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{group.description}</p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
          {label}
        </span>
      </div>

      {/* Amount + members */}
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold">{formatCurrency(group.contributionAmount)}/month</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <UsersIcon className="size-3.5" />
          {group.totalMembers} members
        </span>
      </div>

      {/* Cycle progress — active only */}
      {group.status === 'active' && (
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-muted-foreground">Cycle progress</span>
            <span className="font-medium">{group.currentCycle}/{group.totalCycles}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Recipients — active only */}
      {group.status === 'active' && group.currentRecipient && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Current Recipient
            </p>
            <p className="text-xs font-medium mt-1">{group.currentRecipient}</p>
          </div>
          {group.nextRecipient && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Next Recipient
              </p>
              <p className="text-xs font-medium mt-1">{group.nextRecipient}</p>
            </div>
          )}
        </div>
      )}

      {/* Pending message */}
      {group.status === 'pending' && (
        <p className="text-xs text-muted-foreground">
          Waiting for all members to accept invitation
        </p>
      )}

      {/* Completed message */}
      {group.status === 'completed' && (
        <p className="text-xs text-muted-foreground">
          All {group.totalCycles} cycles completed successfully
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarIcon className="size-3" />
          {formatDate(group.startDate)}
        </div>
        <button
          onClick={() => onViewDetails(group)}
          className="text-xs font-medium text-primary hover:underline"
        >
          View details →
        </button>
      </div>
    </div>
  )
}
