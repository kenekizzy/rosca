import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        notificationPrefs: true,
        accounts: { where: { provider: 'google' }, select: { id: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const defaultPrefs = {
      contributionReminders: true,
      contributionApprovals: true,
      governanceVotes: true,
      penaltyAlerts: true,
      emailNotifications: false,
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name ?? '',
        email: user.email,
        phone: user.phone ?? '',
        location: user.location ?? '',
        notificationPrefs: (user.notificationPrefs as object | null) ?? defaultPrefs,
        hasGoogleAccount: user.accounts.length > 0,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const userId = session.user.id

    if (body.action === 'profile') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: body.name,
          phone: body.phone,
          location: body.location,
        },
      })
      return NextResponse.json({ success: true })
    }

    if (body.action === 'password') {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
      if (!user?.passwordHash) {
        return NextResponse.json({ success: false, error: 'No password set on this account.' }, { status: 400 })
      }
      const valid = await bcrypt.compare(body.currentPassword, user.passwordHash)
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 })
      }
      const newHash = await bcrypt.hash(body.newPassword, 10)
      await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } })
      return NextResponse.json({ success: true })
    }

    if (body.action === 'preferences') {
      await prisma.user.update({ where: { id: userId }, data: { notificationPrefs: body.prefs } })
      return NextResponse.json({ success: true })
    }

    if (body.action === 'delete') {
      await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 })
  }
}
