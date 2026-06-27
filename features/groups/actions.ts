'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { APP_URL, sendInvitationEmail } from '@/lib/email'
import type { CreateGroupData } from '@/components/common/CreateGroupModal'

export async function createGroup(
  data: CreateGroupData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        contributionAmount: data.contributionAmount,
        memberCount: data.memberCount,
        startDate: new Date(data.startDate),
        gracePeriodDays: data.gracePeriodDays,
        penaltyType: data.penaltyType,
        penaltyValue: data.penaltyValue,
        status: 'PENDING_MEMBERS',
        memberships: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
            status: 'ACTIVE',
          },
        },
        invitations: {
          createMany: {
            data: data.memberEmails.map((email) => ({
              email,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })),
            skipDuplicates: true,
          },
        },
      },
    })

    // Fire invitation emails non-blocking — group creation succeeds regardless
    prisma.invitation
      .findMany({ where: { groupId: group.id } })
      .then((invitations) => {
        const ownerName = session.user?.name ?? 'Your group owner'
        const startDate = new Date(data.startDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        return Promise.allSettled(
          invitations.map((inv) =>
            sendInvitationEmail({
              to: inv.email,
              groupName: data.name,
              ownerName,
              contributionAmount: data.contributionAmount,
              memberCount: data.memberCount,
              startDate,
              inviteUrl: `${APP_URL}/invite/${inv.token}`,
            }),
          ),
        )
      })
      .catch((err) => console.error('[email:invitation]', err))

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create group. Please try again.' }
  }
}
