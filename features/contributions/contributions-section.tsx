'use client'

import { useState, useEffect, useCallback } from 'react'
import { PaperclipIcon, ArrowRightIcon, RotateCcwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContributionRecord } from '@/lib/mock-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ContributionDrawer from './contribution-drawer'

type Tab = 'all' | 'under_review' | 'approved' | 'rejected'

const tabs: { label: string; value: Tab }[] = [
  { label: 'All',            value: 'all' },
  { label: 'Pending review', value: 'under_review' },
  { label: 'Approved',       value: 'approved' },
  { label: 'Rejected',       value: 'rejected' },
]

const statusConfig: Record<
  ContributionRecord['status'],
  { label: string; dotClass: string; badgeClass: string }
> = {
  approved:    { label: 'Approved',     dotClass: 'bg-success',  badgeClass: 'bg-success/10 text-success' },
  under_review:{ label: 'Under review', dotClass: 'bg-warning',  badgeClass: 'bg-warning/10 text-warning' },
  rejected:    { label: 'Rejected',     dotClass: 'bg-danger',   badgeClass: 'bg-danger/10 text-danger'   },
  pending:     { label: 'Pending',      dotClass: 'bg-muted-foreground', badgeClass: 'bg-muted text-muted-foreground' },
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

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function ContributionsSection() {
  const [records, setRecords] = useState<ContributionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [selected, setSelected] = useState<ContributionRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchContributions = useCallback(async () => {
    try {
      const res = await fetch('/api/common/contributions')
      const result = await res.json()
      if (result.success) setRecords(result.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContributions()
  }, [fetchContributions])

  const uniqueGroups = Array.from(
    new Map(records.map((r) => [r.groupId, { id: r.groupId, name: r.groupName }])).values()
  )

  const dueNow = records.find((r) => r.status === 'pending') ?? null
  const days   = dueNow ? daysUntil(dueNow.dueDate) : 0

  const history = records.filter((r) => r.status !== 'pending')

  const filtered = history.filter((r) => {
    const matchesTab   = activeTab === 'all' || r.status === activeTab
    const matchesGroup = groupFilter === 'all' || r.groupId === groupFilter
    return matchesTab && matchesGroup
  })

  function handleView(record: ContributionRecord) {
    setSelected(record)
    setDrawerOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Contributions</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Submit and track your payments
            </p>
          </div>
          <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v ?? 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {uniqueGroups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due now banner */}
        {dueNow && (
          <div className="rounded-xl bg-sidebar px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-sidebar-foreground/60 mb-1">
                Due now — {dueNow.groupName}, Cycle {dueNow.cycleNumber}
              </p>
              <p className="text-3xl font-bold text-sidebar-foreground">
                {formatCurrency(dueNow.amount)}
              </p>
              <p className="text-sm text-sidebar-foreground/70 mt-1">
                Due {formatDate(dueNow.dueDate)}
                {days > 0 && ` · ${days} day${days !== 1 ? 's' : ''} remaining`}
                {days === 0 && ' · Due today'}
                {days < 0 && ` · ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`}
              </p>
            </div>
            <button className="shrink-0 flex items-center gap-2 rounded-lg bg-sidebar-foreground px-4 py-2.5 text-sm font-semibold text-sidebar hover:bg-sidebar-foreground/90 transition-colors whitespace-nowrap">
              Submit payment
              <ArrowRightIcon className="size-4" />
            </button>
          </div>
        )}

        {/* Upload evidence dropzone */}
        {dueNow && (
          <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <PaperclipIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Upload payment evidence</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bank receipt, screenshot, or transfer confirmation · PNG, JPG, PDF up to 5MB
              </p>
            </div>
            <button className="mt-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Choose file
            </button>
          </div>
        )}

        {/* Contribution history */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <h2 className="text-base font-semibold">Contribution history</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                All your past contributions
              </p>
            </div>
            {/* Tab filters */}
            <div className="flex items-center gap-1 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    activeTab === tab.value
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Loading contributions...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto] gap-4 px-5 py-2.5 bg-muted/50 border-b border-border">
                {['Group', 'Cycle', 'Amount', 'Method', 'Submitted', 'Status', ''].map((col) => (
                  <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {col}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              <div className="divide-y divide-border">
                {filtered.map((record) => {
                  const { label, dotClass, badgeClass } = statusConfig[record.status]
                  const isRejected = record.status === 'rejected'

                  return (
                    <div
                      key={record.id}
                      className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto] gap-2 sm:gap-4 items-center px-5 py-4 bg-card hover:bg-muted/20 transition-colors"
                    >
                      {/* Group */}
                      <span className="text-sm font-medium">{record.groupName}</span>

                      {/* Cycle */}
                      <span className="text-sm text-muted-foreground">
                        Cycle {record.cycleNumber}
                      </span>

                      {/* Amount */}
                      <span className="text-sm font-semibold">
                        {formatCurrency(record.amount)}
                      </span>

                      {/* Method */}
                      <span className="text-sm text-muted-foreground">
                        {record.paymentMethod ?? '—'}
                      </span>

                      {/* Submitted */}
                      <span className="text-sm text-muted-foreground">
                        {record.submittedAt ? formatDate(record.submittedAt) : '—'}
                      </span>

                      {/* Status */}
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium w-fit',
                          badgeClass
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full shrink-0', dotClass)} />
                        {label}
                      </span>

                      {/* Action */}
                      {isRejected ? (
                        <button
                          onClick={() => handleView(record)}
                          className="flex items-center gap-1 text-xs font-medium text-danger hover:text-danger/80 transition-colors whitespace-nowrap"
                        >
                          <RotateCcwIcon className="size-3" />
                          Re-submit
                        </button>
                      ) : (
                        <button
                          onClick={() => handleView(record)}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                        >
                          View
                          <ArrowRightIcon className="size-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No contributions found</p>
            </div>
          )}

        </div>
      </div>

      <ContributionDrawer
        contribution={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
