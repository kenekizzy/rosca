'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  FeaturedCycle,
  UpcomingCycle,
  CycleStats,
  FeaturedCycleMember,
} from '@/lib/mock-data'
import CycleDrawer, { type CycleDrawerCycle } from '@/components/common/CycleDrawer'

type ApiFeaturedCycle = FeaturedCycle & {
  cycleId: string
  cycleStatus: 'active' | 'upcoming'
  members: FeaturedCycleMember[]
}

type ApiUpcomingCycle = UpcomingCycle & { id: string }

type CyclesData = {
  stats: CycleStats
  featuredCycles: ApiFeaturedCycle[]
  upcomingCycles: ApiUpcomingCycle[]
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

function formatPayoutMonth(dateStr: string) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = String(date.getFullYear()).slice(2)
  return `${month} '${year}`
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <div
      className={cn(
        'shrink-0 rounded-full bg-primary flex items-center justify-center',
        size === 'sm' ? 'size-7' : 'size-9'
      )}
    >
      <span
        className={cn(
          'font-semibold text-primary-foreground',
          size === 'sm' ? 'text-[10px]' : 'text-xs'
        )}
      >
        {getInitials(name)}
      </span>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  subClass,
}: {
  label: string
  value: string
  sub: string
  subClass?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className={cn('text-sm', subClass ?? 'text-muted-foreground')}>{sub}</p>
    </div>
  )
}

const memberStatusConfig = {
  approved: { label: 'Approved', dotClass: 'bg-success',  badgeClass: 'bg-success/10 text-success' },
  pending:  { label: 'Pending',  dotClass: 'bg-warning',  badgeClass: 'bg-warning/10 text-warning' },
  overdue:  { label: 'Overdue',  dotClass: 'bg-overdue',  badgeClass: 'bg-overdue/10 text-overdue' },
} as const

const cycleStatusConfig = {
  active:   { label: 'Active',   dotClass: 'bg-success',  badgeClass: 'bg-success/10 text-success' },
  upcoming: { label: 'Upcoming', dotClass: 'bg-info',     badgeClass: 'bg-info/10 text-info'       },
} as const

export default function CyclesSection() {
  const [data, setData] = useState<CyclesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerCycle, setDrawerCycle] = useState<CycleDrawerCycle | null>(null)

  const fetchCycles = useCallback(async () => {
    try {
      const res = await fetch('/api/common/cycles')
      const result = await res.json()
      if (result.success) setData(result.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCycles()
  }, [fetchCycles])

  const featuredCycles = data?.featuredCycles ?? []
  const upcomingCycles = data?.upcomingCycles ?? []
  const stats = data?.stats

  // Unique active groups for the filter dropdown
  const activeGroupOptions = Array.from(
    new Map(
      featuredCycles
        .filter((c) => c.cycleStatus === 'active')
        .map((c) => [c.groupId, { id: c.groupId, name: c.groupName }])
    ).values()
  )

  // Determine which cycle to feature in the main panel
  const activeFeaturedCycles = featuredCycles.filter((c) => c.cycleStatus === 'active')
  const featured: ApiFeaturedCycle | null = (() => {
    if (selectedCycleId) {
      return featuredCycles.find((c) => c.cycleId === selectedCycleId) ?? activeFeaturedCycles[0] ?? null
    }
    if (groupFilter === 'all') return activeFeaturedCycles[0] ?? null
    return (
      activeFeaturedCycles.find((c) => c.groupId === groupFilter) ??
      activeFeaturedCycles[0] ??
      null
    )
  })()

  const progressPct = featured
    ? Math.round((featured.contributionsReceived / featured.totalContributions) * 100)
    : 0

  function handleGroupFilterChange(v: string | null) {
    setGroupFilter(v ?? 'all')
    setSelectedCycleId(null)
  }

  function handleRowClick(cycle: ApiUpcomingCycle) {
    const fullCycle = featuredCycles.find((c) => c.cycleId === cycle.id)
    if (fullCycle) setSelectedCycleId(fullCycle.cycleId)
  }

  function handleViewDetails() {
    if (!featured) return
    setDrawerCycle({
      cycleId: featured.cycleId,
      cycleStatus: featured.cycleStatus,
      groupName: featured.groupName,
      cycleNumber: featured.cycleNumber,
      totalCycles: featured.totalCycles,
      recipientName: featured.recipientName,
      dueDate: featured.dueDate,
      contributionsReceived: featured.contributionsReceived,
      totalContributions: featured.totalContributions,
      amountReceived: featured.amountReceived,
      totalAmount: featured.totalAmount,
      members: featured.members,
    })
    setDrawerOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Cycles</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track payout rounds across all groups
            </p>
          </div>
          <Select value={groupFilter} onValueChange={handleGroupFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {activeGroupOptions.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Active cycles"
            value={loading ? '—' : String(stats?.activeCycles ?? 0)}
            sub={loading ? '' : `Across ${stats?.activeGroupsCount ?? 0} groups`}
          />
          <StatCard
            label="Your payout position"
            value={
              loading ? '—' : stats?.payoutPosition ? `#${stats.payoutPosition}` : '—'
            }
            sub={loading ? '' : (stats?.payoutGroupName || '—')}
            subClass="text-primary font-medium"
          />
          <StatCard
            label="Next payout to you"
            value={loading ? '—' : formatPayoutMonth(stats?.nextPayoutDate ?? '')}
            sub={
              loading ? '' : stats?.nextPayoutTotal
                ? `${formatCurrency(stats.nextPayoutTotal)} total`
                : '—'
            }
          />
        </div>

        {/* Featured current cycle */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">
              {featured ? `${featured.groupName} — Current cycle` : 'Current cycle'}
            </h2>
            <div className="flex items-center gap-2">
              {featured && (
                <button
                  onClick={handleViewDetails}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View details
                </button>
              )}
              {featured && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                    featured.cycleStatus === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-info/10 text-info'
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      featured.cycleStatus === 'active' ? 'bg-success' : 'bg-info'
                    )}
                  />
                  {featured.cycleStatus === 'active' ? 'Active' : 'Upcoming'}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Loading cycles...</p>
            </div>
          ) : !featured ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No active cycles</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Cycle header */}
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cycle {featured.cycleNumber} of {featured.totalCycles}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={featured.recipientName} size="sm" />
                    <p className="text-sm font-medium">
                      {featured.recipientName} is this cycle&apos;s recipient
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Due date</p>
                  <p className="text-sm font-semibold mt-0.5">{formatDate(featured.dueDate)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="px-5 py-4 border-b border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Contributions received ({featured.contributionsReceived}/{featured.totalContributions})
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {formatCurrency(featured.amountReceived)} of {formatCurrency(featured.totalAmount)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Member rows */}
              <div className="divide-y divide-border">
                {featured.members.map((member) => {
                  const { label, dotClass, badgeClass } = memberStatusConfig[member.status]
                  return (
                    <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={member.name} size="sm" />
                      <span className="flex-1 text-sm font-medium">
                        {member.name}
                        {member.isCurrentUser && (
                          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                            (you)
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(member.amount)}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                          badgeClass
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full shrink-0', dotClass)} />
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming cycles table */}
        <div>
          <h2 className="text-base font-semibold mb-3">Upcoming cycles</h2>
          {loading ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : upcomingCycles.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No upcoming cycles</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_2fr_1.5fr_1.5fr] gap-4 px-5 py-3 bg-muted/50 border-b border-border">
                {['Group', 'Cycle', 'Recipient', 'Due Date', 'Status'].map((col) => (
                  <span
                    key={col}
                    className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {col}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              <div className="divide-y divide-border">
                {upcomingCycles.map((cycle) => {
                  const { label, dotClass, badgeClass } = cycleStatusConfig[cycle.status]
                  const isSelected = selectedCycleId === cycle.id
                  return (
                    <button
                      key={cycle.id}
                      onClick={() => handleRowClick(cycle)}
                      className={cn(
                        'w-full grid grid-cols-[2fr_1fr_2fr_1.5fr_1.5fr] gap-4 items-center px-5 py-4 transition-colors text-left',
                        isSelected ? 'bg-primary/5' : 'hover:bg-muted/20'
                      )}
                    >
                      <span className="text-sm font-medium">{cycle.groupName}</span>
                      <span className="text-sm text-muted-foreground">
                        {cycle.cycleNumber}/{cycle.totalCycles}
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={cycle.recipientName} size="sm" />
                        <span className="text-sm font-medium truncate">{cycle.recipientName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(cycle.dueDate)}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium w-fit',
                          badgeClass
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full shrink-0', dotClass)} />
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CycleDrawer
        cycle={drawerCycle}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
