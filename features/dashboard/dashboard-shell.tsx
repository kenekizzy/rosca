'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import TopBar from './top-bar'
import AppSidebar from '../../components/common/app-sidebar'
import { useAppStore } from '@/lib/store'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const setUser = useAppStore((state) => state.setUser)

  useEffect(() => {
    fetch('/api/common/me')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setUser(result.data)
      })
      .catch(() => {})
  }, [setUser])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border',
          'transition-all duration-200',
          // Desktop: in-flow, no z-index, width animates
          'md:static md:z-auto md:inset-auto',
          sidebarOpen
            ? 'translate-x-0 md:w-60'
            : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'
        )}
      >
        <AppSidebar />
      </aside>

      {/* Right panel: top bar + main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar onToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
