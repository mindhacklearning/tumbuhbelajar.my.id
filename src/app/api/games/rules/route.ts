import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Silakan login dulu' }, { status: 401 })
    }

    const body = await request.json()
    const { gameId, rules } = body

    if (!gameId || !rules) {
      return NextResponse.json({ error: 'gameId dan rules wajib diisi' }, { status: 400 })
    }

    // Verify teacher owns this game
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    })
    if (!teacher) {
      return NextResponse.json({ error: 'Akun guru tidak ditemukan' }, { status: 403 })
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game || game.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Game tidak ditemukan' }, { status: 404 })
    }

    await prisma.game.update({
      where: { id: gameId },
      data: { rules: JSON.stringify(rules) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving rules:', error)
    return NextResponse.json({ error: 'Gagal menyimpan peraturan' }, { status: 500 })
  }
}
