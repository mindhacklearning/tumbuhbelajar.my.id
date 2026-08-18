import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getQuotaSummary } from '@/lib/quota'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    })
    if (!teacher) {
      return NextResponse.json({ error: 'Not a teacher' }, { status: 403 })
    }

    const summary = await getQuotaSummary(teacher.id)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Quota summary error:', error)
    return NextResponse.json({ error: 'Failed to load quota' }, { status: 500 })
  }
}
