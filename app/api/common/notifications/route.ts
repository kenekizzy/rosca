import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      include: { group: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const data = notifications.map((n) => ({
      id: n.id,
      type: n.type.toLowerCase(),
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      groupId: n.groupId,
      groupName: n.group?.name ?? null,
      actionUrl: n.actionUrl,
      createdAt: n.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data })
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

    if (body.markAll) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })
    } else if (body.id) {
      await prisma.notification.updateMany({
        where: { id: body.id, userId },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 })
  }
}
