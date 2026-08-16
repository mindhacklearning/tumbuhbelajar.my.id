import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateQuestions } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gameId, topic, subTopics, difficulty, count = 15 } = body

    // Get game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        teacher: true,
        missions: {
          orderBy: { order: 'asc' },
          take: 1
        }
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check AI actions limit
    const teacher = game.teacher
    if (teacher.aiActionsUsed >= teacher.aiActionsLimit && teacher.subscription === 'FREE') {
      return NextResponse.json({ 
        error: 'AI action limit reached. Upgrade your plan to continue.' 
      }, { status: 403 })
    }

    // Generate questions using AI
    const { questions, cost } = await generateQuestions(
      topic || game.topic,
      subTopics || JSON.parse(game.subTopics || '[]'),
      difficulty || game.difficulty,
      count
    )

    // Create mission if not exists, or use first mission
    let missionId = game.missions[0]?.id
    
    if (!missionId) {
      const mission = await prisma.mission.create({
        data: {
          gameId,
          order: 1,
          title: 'Misi 1: Teka-Teki Pertama',
          description: 'Selesaikan 15 soal pilihan ganda untuk memecahkan kasus Detektif Data.',
          passingScore: 70
        }
      })
      missionId = mission.id
    }

    // Create questions in database
    const createdQuestions = await Promise.all(
      questions.map(q => 
        prisma.question.create({
          data: {
            missionId,
            order: q.order,
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            topic: q.topic,
            type: 'PG',
            points: 10
          }
        })
      )
    )

    // Update AI usage
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { aiActionsUsed: { increment: 1 } }
    })

    // Log AI analysis
    await prisma.aIAnalysis.create({
      data: {
        teacherId: teacher.id,
        type: 'GENERATE_QUESTIONS',
        targetType: 'mission',
        targetId: missionId,
        inputData: JSON.stringify({ topic, subTopics, difficulty, count }),
        outputData: JSON.stringify({ questionCount: questions.length }),
        modelUsed: 'MiniMax-M2.7-highspeed',
        costEstimate: cost,
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({ 
      questions: createdQuestions,
      cost,
      missionId
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}
