'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboardIcon,
  UsersIcon,
  WalletIcon,
  RefreshCwIcon,
  BellIcon,
  SettingsIcon,
  WalletCardsIcon,
  LogOutIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

const navItems = [
  { label: 'Dashboard',     href: '/dashboard',               icon: LayoutDashboardIcon, badge: undefined },
  { label: 'Groups',        href: '/dashboard/groups',        icon: UsersIcon,           badge: undefined },
  { label: 'Contributions', href: '/dashboard/contributions', icon: WalletIcon,          badge: undefined },
  { label: 'Cycles',        href: '/dashboard/cycles',        icon: RefreshCwIcon,       badge: undefined },
  { label: 'Notifications', href: '/dashboard/notifications', icon: BellIcon,            badge: undefined },
]

const accountItems = [
  { label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
]

function getInitials(name: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  badge,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  badge?: number
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'ml-auto min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none',
            active
              ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
              : 'bg-sidebar-accent text-sidebar-accent-foreground'
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

export default function AppSidebar() {
  const pathname = usePathname()
  const user = useAppStore((state) => state.user)
  const setUser = useAppStore((state) => state.setUser)

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  async function handleLogout() {
    setUser(null)
    await signOut({ callbackUrl: '/sign-in' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo — same height as TopBar */}
      <div className="h-16 flex items-center gap-2 px-4 border-b border-sidebar-border shrink-0">
        <WalletCardsIcon className="size-5 text-sidebar-primary" />
        <span className="text-sm font-semibold text-sidebar-foreground">AjoFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        <div className="space-y-1">
          <p className="px-3 mb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 mb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Account
          </p>
          {accountItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      {/* User area */}
      <div className="border-t border-sidebar-border p-3 shrink-0 flex flex-col gap-4 justify-center items-start">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="size-8 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-sidebar-primary-foreground">
              {getInitials(user?.name ?? null)}
            </span>
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name ?? '...'}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email ?? '...'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-left transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOutIcon className="size-4 shrink-0" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  )
}
