import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const statusMap: Record<string, 'pending' | 'approved' | 'under_review' | 'rejected'> = {
  PENDING: 'pending',
  SUBMITTED: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  OVERDUE: 'pending',
}

const paymentMethodMap: Record<string, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  OPAY: 'Opay',
  PALMPAY: 'PalmPay',
  MONIEPOINT: 'Moniepoint',
  CASH: 'Cash',
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const contributions = await prisma.contribution.findMany({
      where: { contributorId: session.user.id },
      include: {
        cycle: {
          include: {
            group: { select: { id: true, name: true } },
            recipient: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = contributions.map((c) => ({
      id: c.id,
      groupId: c.cycle.group.id,
      groupName: c.cycle.group.name,
      cycleNumber: c.cycle.cycleNumber,
      amount: c.amount,
      dueDate: c.cycle.dueDate.toISOString(),
      status: statusMap[c.status as string] ?? 'pending',
      recipientName: c.cycle.recipient.name,
      paymentMethod: c.paymentMethod
        ? (paymentMethodMap[c.paymentMethod as string] ?? c.paymentMethod)
        : null,
      submittedAt: c.submittedAt?.toISOString() ?? null,
    }))

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
