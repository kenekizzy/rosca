import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

function mapContribStatus(status: string): 'approved' | 'pending' | 'overdue' {
  if (status === 'APPROVED') return 'approved'
  if (status === 'OVERDUE') return 'overdue'
  return 'pending'
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const memberships = await prisma.membership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        group: {
          include: {
            memberships: {
              where: { status: 'ACTIVE' },
              include: { user: { select: { id: true, name: true } } },
              orderBy: { payoutPosition: 'asc' },
            },
            cycles: {
              where: { status: { in: ['ACTIVE', 'UPCOMING'] } },
              orderBy: { cycleNumber: 'asc' },
              include: {
                recipient: { select: { id: true, name: true } },
                contributions: {
                  select: { contributorId: true, status: true, amount: true },
                },
              },
            },
          },
        },
      },
    })

    const featuredCycles: object[] = []
    const upcomingCycles: object[] = []
    let activeCyclesCount = 0
    const activeGroupIds = new Set<string>()

    let nextPayoutDate = ''
    let nextPayoutTotal = 0
    let userPayoutPosition = 0
    let userPayoutGroupName = ''

    for (const membership of memberships) {
      const { group } = membership
      const totalCycles = group.memberCount

      for (const cycle of group.cycles) {
        const statusStr = cycle.status as string
        const cycleStatus = statusStr === 'ACTIVE' ? 'active' : 'upcoming'

        if (statusStr === 'ACTIVE') {
          activeCyclesCount++
          activeGroupIds.add(group.id)
        }

        // Track if user is the recipient of this cycle
        if (cycle.recipientUserId === userId) {
          const dueDateStr = cycle.dueDate.toISOString()
          if (!nextPayoutDate || dueDateStr < nextPayoutDate) {
            nextPayoutDate = dueDateStr
            nextPayoutTotal = group.contributionAmount * group.memberships.length
            userPayoutPosition = membership.payoutPosition ?? 0
            userPayoutGroupName = group.name
          }
        }

        const approvedContribs = cycle.contributions.filter(
          (c) => (c.status as string) === 'APPROVED'
        )

        const members = group.memberships.map((m) => {
          const contrib = cycle.contributions.find((c) => c.contributorId === m.userId)
          return {
            id: m.id,
            name: m.user.name ?? 'Unknown',
            isCurrentUser: m.userId === userId,
            amount: group.contributionAmount,
            status: contrib ? mapContribStatus(contrib.status as string) : 'pending',
          }
        })

        featuredCycles.push({
          cycleId: cycle.id,
          cycleStatus,
          groupId: group.id,
          groupName: group.name,
          cycleNumber: cycle.cycleNumber,
          totalCycles,
          recipientName: cycle.recipient.name ?? 'Unknown',
          dueDate: cycle.dueDate.toISOString(),
          contributionsReceived: approvedContribs.length,
          totalContributions: group.memberships.length,
          amountReceived: approvedContribs.reduce((sum, c) => sum + c.amount, 0),
          totalAmount: group.contributionAmount * group.memberships.length,
          members,
        })

        upcomingCycles.push({
          id: cycle.id,
          groupId: group.id,
          groupName: group.name,
          cycleNumber: cycle.cycleNumber,
          totalCycles,
          recipientName: cycle.recipient.name ?? 'Unknown',
          dueDate: cycle.dueDate.toISOString(),
          status: cycleStatus,
        })
      }
    }

    const stats = {
      activeCycles: activeCyclesCount,
      activeGroupsCount: activeGroupIds.size,
      payoutPosition: userPayoutPosition,
      payoutGroupName: userPayoutGroupName,
      nextPayoutDate,
      nextPayoutTotal,
    }

    return NextResponse.json({
      success: true,
      data: { stats, featuredCycles, upcomingCycles },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
