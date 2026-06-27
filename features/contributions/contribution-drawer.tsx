'use client'

import { useEffect } from 'react'
import { XIcon, CheckIcon, ClockIcon, AlertCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContributionRecord } from '@/lib/mock-data'
import { groups, groupContributions } from '@/lib/mock-data'

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

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

const statusConfig = {
  approved:     { label: 'Approved',     className: 'bg-success/10 text-success' },
  under_review: { label: 'Under review', className: 'bg-warning/10 text-warning' },
  rejected:     { label: 'Rejected',     className: 'bg-danger/10 text-danger'   },
  pending:      { label: 'Pending',      className: 'bg-muted text-muted-foreground' },
}

export default function ContributionDrawer({
  contribution,
  open,
  onClose,
}: {
  contribution: ContributionRecord | null
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

  if (!contribution) return null

  const group = groups.find((g) => g.id === contribution.groupId)
  const isCurrentCycle = group?.currentCycle === contribution.cycleNumber
  const cycleMembers = isCurrentCycle ? (groupContributions[contribution.groupId] ?? []) : []

  const { label: statusLabel, className: statusClass } = statusConfig[contribution.status]

  const approvedCount = cycleMembers.filter((m) => m.status === 'approved').length
  const pendingCount  = cycleMembers.filter((m) => m.status === 'pending').length
  const overdueCount  = cycleMembers.filter((m) => m.status === 'overdue').length

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
              <h2 className="text-lg font-semibold truncate">{contribution.groupName}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cycle {contribution.cycleNumber}
                {contribution.recipientName && ` · Recipient: ${contribution.recipientName}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusClass)}>
                ● {statusLabel}
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
            <StatPill label="Amount" value={formatCurrency(contribution.amount)} />
            <StatPill label="Cycle" value={String(contribution.cycleNumber)} />
            <StatPill label="Due Date" value={formatDate(contribution.dueDate)} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* My contribution details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              My Contribution
            </h3>
            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
              <InfoRow label="Status" value={statusLabel} />
              {contribution.submittedAt && (
                <InfoRow label="Submitted" value={formatDate(contribution.submittedAt)} />
              )}
              {contribution.paymentMethod && (
                <InfoRow label="Payment method" value={contribution.paymentMethod} />
              )}
              {!contribution.submittedAt && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <AlertCircleIcon className="size-4 shrink-0" />
                  No payment submitted yet
                </div>
              )}
            </div>
          </div>

          {/* Cycle member approvals */}
          {isCurrentCycle && cycleMembers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cycle Members
                </h3>
                <span className="text-xs text-muted-foreground">
                  {approvedCount} approved · {pendingCount} pending
                  {overdueCount > 0 && ` · ${overdueCount} overdue`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round((approvedCount / cycleMembers.length) * 100)}%` }}
                />
              </div>

              <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {cycleMembers.map((member) => {
                  const initials = member.memberName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()

                  return (
                    <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{initials}</span>
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{member.memberName}</span>
                      {member.status === 'approved' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-success">
                          <CheckIcon className="size-3.5" />
                          Approved
                        </span>
                      ) : member.status === 'overdue' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-overdue">
                          <AlertCircleIcon className="size-3.5" />
                          Overdue
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <ClockIcon className="size-3.5" />
                          Pending
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past cycle — no member breakdown available */}
          {!isCurrentCycle && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Cycle Members
              </h3>
              <div className="rounded-xl border border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Member breakdown is only available for the current cycle
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
