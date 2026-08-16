import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        teacher: {
          select: { displayName: true, slug: true }
        },
        missions: {
          select: { id: true, order: true, title: true }
        },
        _count: {
          select: { attempts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, title, subject, topic, subTopics, difficulty } = body

    // Create game
    const game = await prisma.game.create({
      data: {
        teacherId,
        title,
        subject: subject || 'Matematika',
        topic,
        subTopics: JSON.stringify(subTopics || []),
        difficulty: difficulty || 'MEDIUM',
        status: 'DRAFT'
      }
    })

    return NextResponse.json({ game })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
