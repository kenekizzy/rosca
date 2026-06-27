import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const statusMap: Record<string, string> = {
  DRAFT: 'draft',
  PENDING_MEMBERS: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const memberships = await prisma.membership.findMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        group: {
          include: {
            memberships: {
              where: { status: 'ACTIVE' },
              select: { id: true },
            },
            cycles: {
              orderBy: { cycleNumber: 'asc' },
              include: {
                recipient: { select: { name: true } },
                contributions: {
                  where: { status: 'APPROVED' },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    })

    const groups = memberships.map(({ group }) => {
      const activeCycle = group.cycles.find((c) => c.status === 'ACTIVE')
      const nextCycle = activeCycle
        ? group.cycles.find((c) => c.cycleNumber === activeCycle.cycleNumber + 1)
        : undefined

      return {
        id: group.id,
        name: group.name,
        description: group.description ?? '',
        status: statusMap[group.status] ?? 'draft',
        contributionAmount: group.contributionAmount,
        totalMembers: group.memberships.length || group.memberCount,
        currentCycle: activeCycle?.cycleNumber ?? 0,
        totalCycles: group.cycles.length || group.memberCount,
        currentRecipient: activeCycle?.recipient.name ?? null,
        nextRecipient: nextCycle?.recipient.name ?? null,
        startDate: group.startDate.toISOString(),
        nextDueDate: activeCycle?.dueDate.toISOString() ?? null,
        membersPaidThisCycle: activeCycle?.contributions.length ?? 0,
      }
    })

    return NextResponse.json({ success: true, data: groups })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
