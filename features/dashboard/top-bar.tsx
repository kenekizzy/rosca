'use client'

import { usePathname } from 'next/navigation'
import { BellIcon, PanelLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '../../components/common/theme-toggle'
import { useAppStore } from '@/lib/store'

function getPageTitle(pathname: string) {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export default function TopBar({ onToggle }: { onToggle: () => void }) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const user = useAppStore((state) => state.user)

  return (
    <header className="h-16 shrink-0 border-b border-border bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle sidebar">
          <PanelLeftIcon />
        </Button>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold">{pageTitle}</h1>
          <p className="text-xs text-muted-foreground">Welcome back, {user?.name ?? '...'}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <BellIcon />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
