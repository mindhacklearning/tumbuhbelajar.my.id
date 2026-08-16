import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    // If not logged in and no teacherId specified, return empty
    const games = await prisma.game.findMany({
      where: teacherId ? { teacherId } : undefined,
      include: {
        teacher: {
          select: { displayName: true, slug: true }
        },
        missions: {
          select: { id: true, order: true, title: true, _count: { select: { questions: true } } }
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
    const {
      teacherId,
      title,
      subject,
      category,
      topic,
      subTopics,
      learningObjectives,
      difficulty,
      description
    } = body

    if (!teacherId || !title || !topic) {
      return NextResponse.json(
        { error: 'teacherId, title, dan topic wajib diisi' },
        { status: 400 }
      )
    }

    // Create game
    const game = await prisma.game.create({
      data: {
        teacherId,
        title,
        subject: subject || 'Matematika',
        category: category || null,
        topic,
        subTopics: JSON.stringify(subTopics || []),
        learningObjectives: JSON.stringify(learningObjectives || []),
        difficulty: difficulty || 'MEDIUM',
        description: description || null,
        status: 'DRAFT'
      }
    })

    return NextResponse.json({ game }, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
