'use client'

import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export default function ThemeToggle() {
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [mounted, theme])

  function toggle() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <MoonIcon />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
