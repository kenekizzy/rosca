'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  XIcon,
  PlusIcon,
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  InfoIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

// ─────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
  contributionAmount: z
    .number({ error: 'Required' })
    .min(1, 'Must be greater than ₦0'),
  memberCount: z
    .number({ error: 'Required' })
    .int()
    .min(2, 'Minimum 2 members')
    .max(100, 'Maximum 100 members'),
  startDate: z.string().min(1, 'Start date is required'),
  gracePeriodDays: z
    .number({ error: 'Required' })
    .int()
    .min(1, 'Minimum 1 day')
    .max(30, 'Maximum 30 days'),
  penaltyType: z.enum(['FIXED', 'PERCENTAGE'] as const, {
    error: 'Penalty type is required',
  }),
  penaltyValue: z.number({ error: 'Required' }).min(0, 'Cannot be negative'),
})

const step2Schema = z.object({
  emails: z
    .array(z.object({ value: z.string().email('Enter a valid email address') }))
    .min(1, 'Add at least one member'),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>
type Step = 1 | 2 | 3

// ─────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center w-full">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center flex-1 last:flex-none">
          <div
            className={cn(
              'size-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
              n < current
                ? 'bg-primary text-primary-foreground'
                : n === current
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'border border-border text-muted-foreground bg-background'
            )}
          >
            {n < current ? <CheckIcon className="size-3.5" /> : n}
          </div>
          {n < total && (
            <div
              className={cn('flex-1 h-px', n < current ? 'bg-primary' : 'bg-border')}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {optional && (
          <span className="text-muted-foreground font-normal"> (optional)</span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

export interface CreateGroupData extends Step1Values {
  memberEmails: string[]
}

interface CreateGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateGroup?: (data: CreateGroupData) => Promise<{ success: boolean; error?: string }>
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function CreateGroupModal({
  open,
  onOpenChange,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null)
  const [payoutOrder, setPayoutOrder] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // ── Step 1 form ──────────────────────────────
  const {
    register: reg1,
    handleSubmit: submit1,
    control: ctrl1,
    reset: reset1,
    formState: { errors: err1 },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { gracePeriodDays: 7 },
  })

  // ── Step 2 form ──────────────────────────────
  const {
    register: reg2,
    handleSubmit: submit2,
    control: ctrl2,
    reset: reset2,
    formState: { errors: err2 },
  } = useForm<Step2Values>({ resolver: zodResolver(step2Schema) })

  const { fields, append, remove } = useFieldArray({
    control: ctrl2,
    name: 'emails',
  })

  // ── Helpers ──────────────────────────────────

  function resetAll() {
    reset1()
    reset2({ emails: [] })
    setStep(1)
    setStep1Data(null)
    setPayoutOrder([])
  }

  function handleClose() {
    resetAll()
    onOpenChange(false)
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    setPayoutOrder((prev) => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  function moveDown(idx: number) {
    if (idx === payoutOrder.length - 1) return
    setPayoutOrder((prev) => {
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  // ── Step submit handlers ──────────────────────

  function onStep1Submit(data: Step1Values) {
    setStep1Data(data)
    reset2({
      emails: Array.from({ length: data.memberCount }, () => ({ value: '' })),
    })
    setStep(2)
  }

  function onStep2Submit(data: Step2Values) {
    setPayoutOrder(data.emails.map((e) => e.value))
    setStep(3)
  }

  async function handleCreateGroup() {
    if (!step1Data || !onCreateGroup) return
    setIsCreating(true)
    try {
      const result = await onCreateGroup({ ...step1Data, memberEmails: payoutOrder })
      if (!result.success) {
        toast.error(result.error ?? 'Failed to create group')
        return
      }
      toast.success('Group created successfully')
      handleClose()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // ── Step header config ────────────────────────
  const stepConfig: Record<Step, { title: string; description: string }> = {
    1: { title: 'Create a new group',   description: 'Step 1 of 3 — Group details' },
    2: { title: 'Invite members',        description: 'Step 2 of 3 — Add member emails' },
    3: { title: 'Payout order',          description: 'Step 3 of 3 — Set payout order' },
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent showCloseButton className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{stepConfig[step].title}</DialogTitle>
          <DialogDescription>{stepConfig[step].description}</DialogDescription>
          <StepIndicator current={step} total={3} />
        </DialogHeader>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form
            id="create-group-step1"
            onSubmit={submit1(onStep1Submit)}
            className="flex flex-col gap-4"
          >
            <Field label="Group name" error={err1.name?.message}>
              <Input
                placeholder="e.g. Family Ajo"
                aria-invalid={!!err1.name}
                {...reg1('name')}
              />
            </Field>

            <Field label="Description" optional error={err1.description?.message}>
              <Input
                placeholder="e.g. Monthly family savings circle"
                {...reg1('description')}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Contribution amount (₦)" error={err1.contributionAmount?.message}>
                <Input
                  type="number"
                  placeholder="20,000"
                  min={1}
                  aria-invalid={!!err1.contributionAmount}
                  {...reg1('contributionAmount', { valueAsNumber: true })}
                />
              </Field>
              <Field label="Number of members" error={err1.memberCount?.message}>
                <Input
                  type="number"
                  placeholder="8"
                  min={2}
                  max={100}
                  aria-invalid={!!err1.memberCount}
                  {...reg1('memberCount', { valueAsNumber: true })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date" error={err1.startDate?.message}>
                <Input
                  type="date"
                  aria-invalid={!!err1.startDate}
                  {...reg1('startDate')}
                />
              </Field>
              <Field label="Grace period (days)" error={err1.gracePeriodDays?.message}>
                <Input
                  type="number"
                  placeholder="7"
                  min={1}
                  max={30}
                  aria-invalid={!!err1.gracePeriodDays}
                  {...reg1('gracePeriodDays', { valueAsNumber: true })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Penalty type" error={err1.penaltyType?.message}>
                <Controller
                  name="penaltyType"
                  control={ctrl1}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" aria-invalid={!!err1.penaltyType}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed amount</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Penalty amount (₦)" error={err1.penaltyValue?.message}>
                <Input
                  type="number"
                  placeholder="500"
                  min={0}
                  aria-invalid={!!err1.penaltyValue}
                  {...reg1('penaltyValue', { valueAsNumber: true })}
                />
              </Field>
            </div>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form
            id="create-group-step2"
            onSubmit={submit2(onStep2Submit)}
            className="flex flex-col gap-3"
          >
            <p className="text-sm text-muted-foreground">
              Add the email addresses of members to invite. Each will receive an
              invitation email.
            </p>

            <div className="flex flex-col gap-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      aria-invalid={!!err2.emails?.[idx]?.value}
                      {...reg2(`emails.${idx}.value`)}
                    />
                    {err2.emails?.[idx]?.value && (
                      <p className="text-xs text-destructive mt-1">
                        {err2.emails[idx].value.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-0.5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                    aria-label="Remove member"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => append({ value: '' })}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-fit"
            >
              <PlusIcon className="size-4" />
              Add another member
            </button>

            <div className="flex items-start gap-2 rounded-lg bg-info/10 px-3 py-2.5 text-xs text-info mt-1">
              <InfoIcon className="size-3.5 shrink-0 mt-0.5" />
              <span>
                Members must accept the group rules and penalty terms before the
                group goes active.
              </span>
            </div>
          </form>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Drag or use the arrows to set the order in which members receive
              their payout.
            </p>

            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
              {payoutOrder.map((email, idx) => (
                <div
                  key={email}
                  className="flex items-center gap-3 px-4 py-3 bg-card"
                >
                  <span className="w-5 shrink-0 text-xs font-semibold text-muted-foreground text-right">
                    {idx + 1}
                  </span>
                  <div className="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {email[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{email}</span>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Move up"
                    >
                      <ChevronUpIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === payoutOrder.length - 1}
                      className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Move down"
                    >
                      <ChevronDownIcon className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <DialogFooter>
          {step === 1 && (
            <>
              <Button variant="outline" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button type="submit" form="create-group-step1">
                Next — Invite members
                <ArrowRightIcon />
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => setStep(1)}
              >
                <ArrowLeftIcon />
                Back
              </Button>
              <Button type="submit" form="create-group-step2">
                Next — Payout order
                <ArrowRightIcon />
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => setStep(2)}
              >
                <ArrowLeftIcon />
                Back
              </Button>
              <Button onClick={handleCreateGroup} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create group'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
