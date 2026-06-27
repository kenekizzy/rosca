'use client'

import { useEffect, useState } from 'react'
import { XIcon, CheckIcon, ClockIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Group, GroupStatus } from '@/lib/mock-data'
import { payoutOrders, groupContributions } from '@/lib/mock-data'

type Tab = 'overview' | 'payout-order' | 'contributions'

const tabs: { label: string; value: Tab }[] = [
  { label: 'Overview', value: 'overview' },
  { label: 'Payout Order', value: 'payout-order' },
  { label: 'Contributions', value: 'contributions' },
]

const statusStyles: Record<GroupStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-success/10 text-success' },
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning' },
  completed: { label: 'Completed', className: 'bg-info/10 text-info' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
}

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

export default function GroupDrawer({
  group,
  open,
  onClose,
}: {
  group: Group | null
  open: boolean
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    if (open) setActiveTab('overview')
  }, [group?.id, open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const status = group ? statusStyles[group.status] : null
  const paidPct =
    group && group.membersPaidThisCycle
      ? Math.round((group.membersPaidThisCycle / group.totalMembers) * 100)
      : 0

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
          'sm:w-[400px] transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {group && status && (
          <>
            {/* Header */}
            <div className="shrink-0 border-b border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold truncate">{group.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{group.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', status.className)}>
                    ● {status.label}
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
                <StatPill label="Contribution" value={formatCurrency(group.contributionAmount)} />
                <StatPill label="Cycle" value={`${group.currentCycle}/${group.totalCycles}`} />
                {group.healthScore !== undefined && (
                  <StatPill label="Health" value={`${group.healthScore}%`} />
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="shrink-0 border-b border-border px-5">
              <nav className="flex gap-1 -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      'px-3 py-3 text-sm font-medium border-b-2 transition-colors',
                      activeTab === tab.value
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === 'overview' && (
                <>
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    <InfoRow label="Frequency" value="Monthly" />
                    {group.currentRecipient && (
                      <InfoRow label="Current recipient" value={group.currentRecipient} />
                    )}
                    {group.nextRecipient && (
                      <InfoRow label="Next recipient" value={group.nextRecipient} />
                    )}
                    {group.nextDueDate && (
                      <InfoRow label="Next due date" value={formatDate(group.nextDueDate)} />
                    )}
                  </div>

                  {group.membersPaidThisCycle !== undefined && (
                    <div className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Members paid this cycle</span>
                        <span className="text-sm font-semibold">
                          {group.membersPaidThisCycle}/{group.totalMembers}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${paidPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'payout-order' && (() => {
                const members = payoutOrders[group.id] ?? []
                return members.length > 0 ? (
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {members.map((member) => {
                      const initials = member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                      return (
                        <div key={member.position} className="flex items-center gap-3 px-4 py-3">
                          <span className="w-5 shrink-0 text-xs text-muted-foreground text-right">
                            {member.position}
                          </span>
                          <div className="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{initials}</span>
                          </div>
                          <span className="flex-1 text-sm font-medium">{member.name}</span>
                          {member.contributionStatus === 'paid' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-success">
                              <CheckIcon className="size-3.5" />
                              Paid
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
                ) : (
                  <div className="rounded-xl border border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">No payout order available</p>
                  </div>
                )
              })()}

              {activeTab === 'contributions' && (() => {
                const contribs = groupContributions[group.id] ?? []

                const statusConfig = {
                  approved: { label: 'Approved', className: 'bg-success/10 text-success' },
                  pending:  { label: 'Pending',  className: 'bg-warning/10 text-warning' },
                  overdue:  { label: 'Overdue',  className: 'bg-overdue/10 text-overdue' },
                  rejected: { label: 'Rejected', className: 'bg-danger/10 text-danger'   },
                }

                return contribs.length > 0 ? (
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {contribs.map((c) => {
                      const initials = c.memberName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                      const { label, className } = statusConfig[c.status]
                      const date = new Date(c.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })

                      return (
                        <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                          <div className="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{c.memberName}</p>
                            <p className="text-xs text-muted-foreground">{c.paymentMethod} · {date}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold">₦{c.amount.toLocaleString()}</p>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium mt-0.5 ${className}`}>
                              ● {label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">No contributions yet this cycle</p>
                  </div>
                )
              })()}
            </div>
          </>
        )}
      </div>
    </>
  )
}
