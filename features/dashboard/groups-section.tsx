'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  SearchIcon,
  PlusIcon,
  UsersIcon,
  ActivityIcon,
  ClockIcon,
  CheckCircleIcon,
} from 'lucide-react'
import type { Group, GroupStatus } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import GroupCard from './group-card'
import GroupDrawer from '@/components/common/GroupDrawer'
import CreateGroupModal, { type CreateGroupData } from '@/components/common/CreateGroupModal'
import { createGroup } from '@/features/groups/actions'

type Tab = 'all' | GroupStatus

const tabs: { label: string; value: Tab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
]

const summaryIcons = [
  { label: 'Total Groups', key: 'total',     icon: UsersIcon,        className: 'bg-primary/10 text-primary' },
  { label: 'Active',       key: 'active',    icon: ActivityIcon,     className: 'bg-success/10 text-success' },
  { label: 'Pending',      key: 'pending',   icon: ClockIcon,        className: 'bg-warning/10 text-warning' },
  { label: 'Completed',    key: 'completed', icon: CheckCircleIcon,  className: 'bg-info/10 text-info' },
] as const

export default function GroupsSection() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/common/groups')
      const result = await res.json()
      if (result.success) setGroups(result.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  async function handleCreateGroup(data: CreateGroupData) {
    const result = await createGroup(data)
    if (result.success) fetchGroups()
    return result
  }

  function handleViewDetails(group: Group) {
    setSelectedGroup(group)
    setDrawerOpen(true)
  }

  const total     = groups.length
  const active    = groups.filter((g) => g.status === 'active').length
  const pending   = groups.filter((g) => g.status === 'pending').length
  const completed = groups.filter((g) => g.status === 'completed').length
  const counts = { total, active, pending, completed }

  const filtered = groups.filter((g) => {
    const matchesTab = activeTab === 'all' || g.status === activeTab
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <>
      <div className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summaryIcons.map(({ label, key, icon: Icon, className }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
            >
              <div className={`size-9 shrink-0 rounded-lg flex items-center justify-center ${className}`}>
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{loading ? '—' : counts[key]}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Groups list */}
        <section>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center flex-wrap gap-1">
              <h2 className="text-base font-semibold mr-2">My Groups</h2>
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm transition-colors',
                    activeTab === tab.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-44 pl-8 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                <PlusIcon />
                New Group
              </Button>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Loading groups...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((group) => (
                <GroupCard key={group.id} group={group} onViewDetails={handleViewDetails} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No groups found</p>
            </div>
          )}
        </section>
      </div>

      <GroupDrawer
        group={selectedGroup}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateGroup={handleCreateGroup}
      />
    </>
  )
}
