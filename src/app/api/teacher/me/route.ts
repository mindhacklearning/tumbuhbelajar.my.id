import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Auto-provision: get current teacher, create Teacher record if missing
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    let teacher = await prisma.teacher.findUnique({
      where: { userId },
    })

    if (!teacher) {
      // Auto-create teacher record from Google profile
      const user = await prisma.user.findUnique({ where: { id: userId } })
      const baseName = user?.name || session.user.name || 'Guru'
      const slugBase = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Ensure unique slug
      let slug = slugBase || 'guru'
      let counter = 1
      while (await prisma.teacher.findUnique({ where: { slug } })) {
        slug = `${slugBase}-${counter}`
        counter++
      }

      teacher = await prisma.teacher.create({
        data: {
          userId,
          slug,
          displayName: baseName,
          referralCode: `TB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        },
      })
    }

    return NextResponse.json({ teacher })
  } catch (error) {
    console.error('Error getting teacher:', error)
    return NextResponse.json({ error: 'Failed to get teacher' }, { status: 500 })
  }
}
