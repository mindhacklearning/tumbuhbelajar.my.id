import { prisma } from '@/lib/prisma'

// Get teacher for a user, auto-creating the record if it doesn't exist yet.
// Called from server components/pages — keeps teacher provisioning consistent.
export async function getOrCreateTeacher(userId: string) {
  let teacher = await prisma.teacher.findUnique({ where: { userId } })

  if (!teacher) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const baseName = user?.name || 'Guru'
    const slugBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

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

  return teacher
}
