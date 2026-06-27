'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

type NotifPrefs = {
  contributionReminders: boolean
  contributionApprovals: boolean
  governanceVotes: boolean
  penaltyAlerts: boolean
  emailNotifications: boolean
}

type ProfileData = {
  name: string
  email: string
  phone: string
  location: string
  notificationPrefs: NotifPrefs
  hasGoogleAccount: boolean
}

type NavSection = 'profile' | 'notifications' | 'security' | 'connected' | 'danger'

const navItems: { label: string; value: NavSection; danger?: boolean }[] = [
  { label: 'Profile',            value: 'profile' },
  { label: 'Notifications',      value: 'notifications' },
  { label: 'Security',           value: 'security' },
  { label: 'Connected accounts', value: 'connected' },
  { label: 'Danger zone',        value: 'danger', danger: true },
]

const notifRows: { key: keyof NotifPrefs; label: string; description: string }[] = [
  { key: 'contributionReminders', label: 'Contribution reminders', description: 'Get reminded before your contribution is due' },
  { key: 'contributionApprovals', label: 'Contribution approvals', description: 'When someone approves or rejects your payment' },
  { key: 'governanceVotes',       label: 'Governance votes',       description: 'When a new proposal requires your vote' },
  { key: 'penaltyAlerts',         label: 'Penalty alerts',         description: 'When a penalty is applied to any member' },
  { key: 'emailNotifications',    label: 'Email notifications',    description: 'Receive all alerts via email as well' },
]

const defaultPrefs: NotifPrefs = {
  contributionReminders: true,
  contributionApprovals: true,
  governanceVotes: true,
  penaltyAlerts: true,
  emailNotifications: false,
}

export default function SettingsSection() {
  const [profile, setProfile]   = useState<ProfileData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [activeNav, setActiveNav] = useState<NavSection>('profile')

  // Profile form state
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [location, setLocation] = useState('')
  const [prefs, setPrefs]       = useState<NotifPrefs>(defaultPrefs)
  const [savingProfile, setSavingProfile]     = useState(false)
  const [savingPassword, setSavingPassword]   = useState(false)
  const [savingPrefs, setSavingPrefs]         = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Password form state
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')

  const profileRef       = useRef<HTMLElement>(null)
  const notificationsRef = useRef<HTMLElement>(null)
  const securityRef      = useRef<HTMLElement>(null)
  const connectedRef     = useRef<HTMLElement>(null)
  const dangerRef        = useRef<HTMLElement>(null)

  const sectionRefs: Record<NavSection, React.RefObject<HTMLElement | null>> = {
    profile:       profileRef,
    notifications: notificationsRef,
    security:      securityRef,
    connected:     connectedRef,
    danger:        dangerRef,
  }

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/common/settings')
      const result = await res.json()
      if (result.success) {
        const d: ProfileData = result.data
        setProfile(d)
        setName(d.name)
        setPhone(d.phone)
        setLocation(d.location)
        setPrefs((d.notificationPrefs as NotifPrefs) ?? defaultPrefs)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  function handleNavClick(section: NavSection) {
    setActiveNav(section)
    sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    try {
      const res = await fetch('/api/common/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'profile', name, phone, location }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Profile updated')
        setProfile((p) => p ? { ...p, name, phone, location } : p)
      } else {
        toast.error(result.error ?? 'Failed to update profile')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSavePassword() {
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/common/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'password', currentPassword: currentPw, newPassword: newPw }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Password updated')
        setCurrentPw(''); setNewPw(''); setConfirmPw('')
      } else {
        toast.error(result.error ?? 'Failed to update password')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleSavePrefs(newPrefs: NotifPrefs) {
    setPrefs(newPrefs)
    setSavingPrefs(true)
    try {
      const res = await fetch('/api/common/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preferences', prefs: newPrefs }),
      })
      const result = await res.json()
      if (!result.success) toast.error(result.error ?? 'Failed to save preferences')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSavingPrefs(false)
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    setDeleting(true)
    try {
      await fetch('/api/common/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' }),
      })
      toast.success('Account deleted. You will be signed out.')
      window.location.href = '/sign-in'
    } catch {
      toast.error('Something went wrong')
      setDeleting(false)
    }
  }

  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* Left nav */}
          <nav className="w-52 shrink-0 rounded-xl border border-border bg-card overflow-hidden">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleNavClick(item.value)}
                className={cn(
                  'w-full text-left px-4 py-3 text-sm transition-colors block',
                  item.danger
                    ? 'text-destructive hover:bg-destructive/5'
                    : cn('text-foreground hover:bg-muted', activeNav === item.value && 'font-medium bg-muted/60')
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Profile */}
            <section ref={profileRef} className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold">Profile information</h2>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg shrink-0">
                  {initials || '?'}
                </div>
                <div>
                  <p className="font-medium text-sm">{name || '...'}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <Button variant="outline" size="sm" className="mt-2">Change photo</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Full name</Label>
                  <Input className="h-10" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email address</Label>
                  <Input className="h-10" type="email" value={profile?.email ?? ''} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Phone number</Label>
                  <Input className="h-10" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <Input className="h-10" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save changes'}
              </Button>
            </section>

            {/* Notifications */}
            <section ref={notificationsRef} className="rounded-xl border border-border bg-card p-6 space-y-1">
              <h2 className="font-semibold mb-4">Notification preferences</h2>
              <div className="divide-y divide-border">
                {notifRows.map((row) => (
                  <div key={row.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{row.description}</p>
                    </div>
                    <Switch
                      checked={prefs[row.key]}
                      disabled={savingPrefs}
                      onCheckedChange={(checked: boolean) => handleSavePrefs({ ...prefs, [row.key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Security */}
            <section ref={securityRef} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Security</h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Current password</Label>
                  <Input className="h-10" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">New password</Label>
                  <Input className="h-10" type="password" placeholder="Min. 8 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Confirm new password</Label>
                  <Input className="h-10" type="password" placeholder="Repeat new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                </div>
              </div>
              <Button variant="outline" onClick={handleSavePassword} disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update password'}
              </Button>
            </section>

            {/* Connected accounts */}
            <section ref={connectedRef} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Connected accounts</h2>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">G</div>
                  <div>
                    <p className="text-sm font-medium">Google</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.hasGoogleAccount ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                {!profile?.hasGoogleAccount && <Button variant="outline" size="sm">Connect</Button>}
              </div>
            </section>

            {/* Danger zone */}
            <section ref={dangerRef} className="rounded-xl border border-destructive/40 bg-card p-6 space-y-4">
              <h2 className="font-semibold text-destructive">Danger zone</h2>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Delete account</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Permanently remove your account and all data.<br />This cannot be undone.
                  </p>
                </div>
                <Button
                  className="shrink-0 bg-destructive text-white hover:bg-destructive/90"
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? 'Deleting...' : 'Delete account'}
                </Button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
