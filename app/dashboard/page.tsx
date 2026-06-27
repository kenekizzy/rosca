'use client'

import { useState, useEffect } from 'react'
import {
  UsersIcon,
  ActivityIcon,
  WalletIcon,
  CalendarIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import type { Group, ContributionHealth } from '@/lib/mock-data'
import StatCard from '@/features/dashboard/stat-card'
import MonthlyCommitments from '@/features/dashboard/monthly-commitments'
import ContributionHealthCard from '@/features/dashboard/contribution-health'
import GroupsSection from '@/features/dashboard/groups-section'

function formatCurrency(n: number) {
  return `₦${n.toLocaleString()}`
}

type ContribRecord = {
  status: string
  submittedAt: string | null
  dueDate: string
}

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [contributions, setContributions] = useState<ContribRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/common/groups').then((r) => r.json()),
      fetch('/api/common/contributions').then((r) => r.json()),
    ])
      .then(([groupsResult, contribsResult]) => {
        if (groupsResult.success) setGroups(groupsResult.data)
        if (contribsResult.success) setContributions(contribsResult.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeGroups = groups.filter((g) => g.status === 'active')
  const monthlyCommitment = activeGroups.reduce((sum, g) => sum + g.contributionAmount, 0)
  const upcomingContributions = contributions.filter((c) => c.status === 'pending').length

  const approvedCount = contributions.filter((c) => c.status === 'approved').length
  const rejectedCount = contributions.filter((c) => c.status === 'rejected').length
  const totalDecided = approvedCount + rejectedCount
  const onTime = contributions.filter(
    (c) =>
      c.status === 'approved' &&
      c.submittedAt &&
      new Date(c.submittedAt) <= new Date(c.dueDate)
  ).length
  const health: ContributionHealth = {
    onTime,
    late: approvedCount - onTime,
    penalties: 0,
    approvalRate: totalDecided > 0 ? Math.round((approvedCount / totalDecided) * 100) : 100,
  }

  const placeholder = '—'
  const stats = [
    {
      title: 'Total Groups',
      value: loading ? placeholder : String(groups.length),
      subtitle: 'Saving circles',
      icon: UsersIcon,
    },
    {
      title: 'Active Groups',
      value: loading ? placeholder : String(activeGroups.length),
      subtitle: 'Running circles',
      icon: ActivityIcon,
    },
    {
      title: 'Monthly Commitment',
      value: loading ? placeholder : formatCurrency(monthlyCommitment),
      icon: WalletIcon,
    },
    {
      title: 'Upcoming Contributions',
      value: loading ? placeholder : String(upcomingContributions),
      subtitle: 'Pending this cycle',
      icon: CalendarIcon,
    },
    {
      title: 'Upcoming Payouts',
      value: placeholder,
      subtitle: 'Coming soon',
      icon: TrendingUpIcon,
    },
    {
      title: 'Credit Access',
      value: loading ? placeholder : `${health.approvalRate}%`,
      subtitle: 'Approval rate',
      icon: ShieldCheckIcon,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Overview panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyCommitments groups={activeGroups} total={monthlyCommitment} />
        <ContributionHealthCard health={health} />
      </div>

      {/* Groups */}
      <GroupsSection />
    </div>
  )
}
