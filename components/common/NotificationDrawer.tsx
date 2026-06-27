'use client'

import { useEffect } from 'react'
import {
  XIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FileTextIcon,
  UserPlusIcon,
  UserMinusIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  PartyPopperIcon,
  PauseCircleIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type DrawerNotification = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  groupName: string | null
  actionUrl: string | null
  createdAt: string
}

type TypeConfig = {
  Icon: React.ComponentType<{ className?: string }>
  iconClass: string
  bgClass: string
}

const typeConfig: Record<string, TypeConfig> = {
  contribution_due:      { Icon: ClockIcon,         iconClass: 'text-warning-foreground', bgClass: 'bg-warning/20' },
  contribution_approved: { Icon: CheckCircleIcon,   iconClass: 'text-success-foreground', bgClass: 'bg-success/20' },
  contribution_rejected: { Icon: XCircleIcon,       iconClass: 'text-danger-foreground',  bgClass: 'bg-danger/20' },
  contribution_submitted:{ Icon: FileTextIcon,      iconClass: 'text-info-foreground',    bgClass: 'bg-info/20' },
  penalty_applied:       { Icon: AlertCircleIcon,   iconClass: 'text-overdue',            bgClass: 'bg-overdue/10' },
  proposal_created:      { Icon: FileTextIcon,      iconClass: 'text-muted-foreground',   bgClass: 'bg-muted' },
  proposal_approved:     { Icon: CheckCircleIcon,   iconClass: 'text-success-foreground', bgClass: 'bg-success/20' },
  proposal_rejected:     { Icon: XCircleIcon,       iconClass: 'text-danger-foreground',  bgClass: 'bg-danger/20' },
  proposal_expired:      { Icon: ClockIcon,         iconClass: 'text-muted-foreground',   bgClass: 'bg-muted' },
  member_joined:         { Icon: UserPlusIcon,      iconClass: 'text-muted-foreground',   bgClass: 'bg-muted' },
  member_removed:        { Icon: UserMinusIcon,     iconClass: 'text-danger-foreground',  bgClass: 'bg-danger/20' },
  group_paused:          { Icon: PauseCircleIcon,   iconClass: 'text-warning-foreground', bgClass: 'bg-warning/20' },
  group_dissolved:       { Icon: AlertCircleIcon,   iconClass: 'text-danger-foreground',  bgClass: 'bg-danger/20' },
  payout_upcoming:       { Icon: TrendingUpIcon,    iconClass: 'text-info-foreground',    bgClass: 'bg-info/20' },
  payout_received:       { Icon: PartyPopperIcon,   iconClass: 'text-success-foreground', bgClass: 'bg-success/20' },
}

const fallbackConfig: TypeConfig = {
  Icon: FileTextIcon,
  iconClass: 'text-muted-foreground',
  bgClass: 'bg-muted',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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

export default function NotificationDrawer({
  notification,
  open,
  onClose,
}: {
  notification: DrawerNotification | null
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const cfg = notification ? (typeConfig[notification.type] ?? fallbackConfig) : fallbackConfig
  const { Icon, iconClass, bgClass } = cfg

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl',
          'sm:w-[400px] transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border p-5 flex items-center justify-between">
          <h2 className="text-base font-semibold">Notification</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {notification && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Icon + title */}
            <div className="flex items-start gap-4">
              <div className={cn('mt-0.5 size-10 shrink-0 rounded-xl flex items-center justify-center', bgClass)}>
                <Icon className={cn('size-5', iconClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{notification.title}</p>
                {notification.groupName && (
                  <p className="text-xs text-muted-foreground mt-0.5">{notification.groupName}</p>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-4">
              <p className="text-sm leading-relaxed">
                <HighlightedText text={notification.message} />
              </p>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>

            {/* Action link */}
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                View details →
              </a>
            )}
          </div>
        )}
      </div>
    </>
  )
}
