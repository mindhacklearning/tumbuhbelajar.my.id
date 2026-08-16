import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateQuestions, type QuestionType } from '@/lib/ai'

const VALID_TYPES: QuestionType[] = ['PG', 'BENAR_SALAH', 'PG_KOMPLEKS', 'NUMERIK', 'ISIAN', 'MENJODOHKAN', 'URUTAN']

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gameId, topic, subTopics, difficulty, count = 15, questionTypes } = body

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

    // Safely parse subTopics — handle both string and array input
    let parsedSubTopics: string[] = []
    if (subTopics) {
      if (Array.isArray(subTopics)) {
        parsedSubTopics = subTopics
      } else if (typeof subTopics === 'string') {
        try {
          parsedSubTopics = JSON.parse(subTopics)
        } catch {
          return NextResponse.json({ error: 'Invalid subTopics format' }, { status: 400 })
        }
      }
    } else {
      // Fallback to game.subTopics
      try {
        parsedSubTopics = JSON.parse(game.subTopics || '[]')
      } catch {
        parsedSubTopics = []
      }
    }

    // Safely parse existing learning objectives from game
    let parsedObjectives: string[] = []
    try {
      parsedObjectives = JSON.parse(game.learningObjectives || '[]')
    } catch {
      parsedObjectives = []
    }

    // Validate question types
    let types: QuestionType[] = []
    if (Array.isArray(questionTypes) && questionTypes.length > 0) {
      types = questionTypes.filter((t): t is QuestionType =>
        VALID_TYPES.includes(t as QuestionType)
      )
    }
    if (types.length === 0) types = ['PG']

    // Generate questions using AI (AI creates objectives if none provided)
    const { questions, learningObjectives, cost, modelUsed, usage } = await generateQuestions(
      topic || game.topic,
      parsedSubTopics,
      difficulty || game.difficulty,
      count,
      parsedObjectives,
      types
    )

    // Save AI-generated objectives back to game if they were empty
    if (learningObjectives.length > 0 && parsedObjectives.length === 0) {
      await prisma.game.update({
        where: { id: gameId },
        data: { learningObjectives: JSON.stringify(learningObjectives) },
      })
    }

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
      questions.map(q => {
        const type = (q.type && VALID_TYPES.includes(q.type as QuestionType))
          ? q.type
          : 'PG'

        // Store type-specific data in correctAnswer JSON:
        // - PG/BENAR_SALAH/NUMERIK/ISIAN: plain answer
        // - PG_KOMPLEKS: JSON array of correct options
        // - MENJODOHKAN: pairs + answer code
        // - URUTAN: steps + answer order
        let correctValue = q.correctAnswer || ''
        if (type === 'PG_KOMPLEKS' && q.correctAnswers) {
          correctValue = JSON.stringify(q.correctAnswers)
        }
        if (type === 'MENJODOHKAN') {
          correctValue = JSON.stringify({ pairs: q.pairs, answer: q.correctAnswer })
        }
        if (type === 'URUTAN') {
          correctValue = JSON.stringify({ steps: q.steps, answer: q.correctAnswer })
        }

        return prisma.question.create({
          data: {
            missionId,
            order: q.order,
            text: q.text,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: correctValue,
            explanation: q.explanation,
            difficulty: q.difficulty,
            topic: q.topic,
            type,
            points: 10
          }
        })
      })
    )

    // Update AI usage
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { aiActionsUsed: { increment: 1 } }
    })

    // Log AI analysis with actual model used
    await prisma.aIAnalysis.create({
      data: {
        teacherId: teacher.id,
        type: 'GENERATE_QUESTIONS',
        targetType: 'mission',
        targetId: missionId,
        inputData: JSON.stringify({ topic, subTopics, difficulty, count }),
        outputData: JSON.stringify({ questionCount: questions.length }),
        modelUsed: modelUsed,
        costEstimate: cost,
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      questions: createdQuestions,
      total: questions.length,
      learningObjectives,
      usage: {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
      },
      remaining: Math.max(0, teacher.aiActionsLimit - (teacher.aiActionsUsed + 1)),
      modelUsed
    })
  } catch (error) {
    console.error('Generate questions error:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
