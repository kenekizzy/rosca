'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ClockIcon,
  FileTextIcon,
  XCircleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  PartyPopperIcon,
  PauseCircleIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import NotificationDrawer, { type DrawerNotification } from '@/components/common/NotificationDrawer'
import { toast } from 'sonner'

type ApiNotification = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  groupId: string | null
  groupName: string | null
  actionUrl: string | null
  createdAt: string
}

type Tab = 'all' | 'unread' | 'contributions' | 'governance'

const tabs: { label: string; value: Tab }[] = [
  { label: 'All',           value: 'all' },
  { label: 'Unread',        value: 'unread' },
  { label: 'Contributions', value: 'contributions' },
  { label: 'Governance',    value: 'governance' },
]

const contributionTypes = new Set([
  'contribution_due', 'contribution_approved', 'contribution_rejected', 'contribution_submitted',
])
const governanceTypes = new Set([
  'proposal_created', 'proposal_approved', 'proposal_rejected', 'proposal_expired',
  'member_joined', 'member_removed', 'group_paused', 'group_dissolved',
])

type TypeConfig = {
  Icon: React.ComponentType<{ className?: string }>
  iconClass: string
  bgClass: string
}

const typeConfig: Record<string, TypeConfig> = {
  contribution_due:       { Icon: ClockIcon,         iconClass: 'text-warning-foreground', bgClass: 'bg-warning/20' },
  contribution_approved:  { Icon: CheckCircleIcon,   iconClass: 'text-success-foreground', bgClass: 'bg-success/20' },
  contribution_rejected:  { Icon: XCircleIcon,       iconClass: 'text-danger-foreground',  bgClass: 'bg-danger/20' },
  contribution_submitted: { Icon: FileTextIcon,      iconClass: 'text-info-foreground',    bgClass: 'bg-info/20' },
  penalty_applied:        { Icon: AlertCircleIcon,   iconClass: 'text-overdue',            bgClass: 'bg-overdue/10' },
  proposal_created:       { Icon: FileTextIcon,      iconClass: 'text-muted-foreground',   bgClass: 'bg-muted' },
  proposal_approved:      { Icon: CheckCircleIcon,   iconClass: 'text-success-foreground', bgClass: 'bg-success/20' },
  proposal_rejected:      { Icon: XCircleIcon,       iconClass: 'text-danger-foreground',  bgClass: 'bg-danger/20' },
  proposal_expired:       { Icon: ClockIcon,         iconClass: 'text-muted-foreground',   bgClass: 'bg-muted' },
  member_joined:          { Icon: UserPlusIcon,      iconClass: 'text-muted-foreground',   bgClass: 'bg-muted' },
  member_removed:         { Icon: UserMinusIcon,     iconClass: 'text-danger-foreground',  bgClass: 'bg-danger/20' },
  group_paused:           { Icon: PauseCircleIcon,   iconClass: 'text-warning-foreground', bgClass: 'bg-warning/20' },
  group_dissolved:        { Icon: AlertCircleIcon,   iconClass: 'text-danger-foreground',  bgClass: 'bg-danger/20' },
  payout_upcoming:        { Icon: TrendingUpIcon,    iconClass: 'text-info-foreground',    bgClass: 'bg-info/20' },
  payout_received:        { Icon: PartyPopperIcon,   iconClass: 'text-success-foreground', bgClass: 'bg-success/20' },
}

const fallbackConfig: TypeConfig = {
  Icon: FileTextIcon,
  iconClass: 'text-muted-foreground',
  bgClass: 'bg-muted',
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function groupByDate(items: ApiNotification[]) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yestStart = new Date(todayStart.getTime() - 86400000)
  return {
    today:     items.filter((n) => new Date(n.createdAt) >= todayStart),
    yesterday: items.filter((n) => { const d = new Date(n.createdAt); return d >= yestStart && d < todayStart }),
    earlier:   items.filter((n) => new Date(n.createdAt) < yestStart),
  }
}

function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <span key={i} className="text-primary font-medium">{part.slice(2, -2)}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">
      {label}
    </p>
  )
}

function NotificationRow({
  item,
  onClick,
}: {
  item: ApiNotification
  onClick: (item: ApiNotification) => void
}) {
  const { Icon, iconClass, bgClass } = typeConfig[item.type] ?? fallbackConfig

  return (
    <button
      onClick={() => onClick(item)}
      className={cn(
        'w-full flex items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30',
        !item.isRead && 'bg-primary/5'
      )}
    >
      <div className={cn('mt-0.5 size-9 shrink-0 rounded-lg flex items-center justify-center', bgClass)}>
        <Icon className={cn('size-4', iconClass)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', item.isRead ? 'font-medium' : 'font-semibold')}>
          {item.title}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          <HighlightedText text={item.message} />
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">{formatTimestamp(item.createdAt)}</p>
      </div>
      {!item.isRead && (
        <div className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}

export default function NotificationsSection() {
  const [items, setItems]     = useState<ApiNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [drawerNotif, setDrawerNotif] = useState<DrawerNotification | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/common/notifications')
      const result = await res.json()
      if (result.success) setItems(result.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const unreadCount = items.filter((n) => !n.isRead).length

  async function handleMarkAllRead() {
    try {
      await fetch('/api/common/notifications', { method: 'PATCH', body: JSON.stringify({ markAll: true }), headers: { 'Content-Type': 'application/json' } })
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  async function handleRowClick(item: ApiNotification) {
    setDrawerNotif({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      isRead: item.isRead,
      groupName: item.groupName,
      actionUrl: item.actionUrl,
      createdAt: item.createdAt,
    })
    setDrawerOpen(true)

    if (!item.isRead) {
      try {
        await fetch('/api/common/notifications', {
          method: 'PATCH',
          body: JSON.stringify({ id: item.id }),
          headers: { 'Content-Type': 'application/json' },
        })
        setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, isRead: true } : n))
      } catch {
        // silent
      }
    }
  }

  const filtered = items.filter((n) => {
    if (activeTab === 'unread')        return !n.isRead
    if (activeTab === 'contributions') return contributionTypes.has(n.type)
    if (activeTab === 'governance')    return governanceTypes.has(n.type)
    return true
  })

  const grouped = groupByDate(filtered)

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? '' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-3 border-b border-border">
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

          {loading ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {grouped.today.length > 0 && (
                <div>
                  <SectionLabel label="Today" />
                  <div className="divide-y divide-border">
                    {grouped.today.map((n) => <NotificationRow key={n.id} item={n} onClick={handleRowClick} />)}
                  </div>
                </div>
              )}
              {grouped.yesterday.length > 0 && (
                <div>
                  <SectionLabel label="Yesterday" />
                  <div className="divide-y divide-border">
                    {grouped.yesterday.map((n) => <NotificationRow key={n.id} item={n} onClick={handleRowClick} />)}
                  </div>
                </div>
              )}
              {grouped.earlier.length > 0 && (
                <div>
                  <SectionLabel label="Earlier" />
                  <div className="divide-y divide-border">
                    {grouped.earlier.map((n) => <NotificationRow key={n.id} item={n} onClick={handleRowClick} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <NotificationDrawer
        notification={drawerNotif}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
