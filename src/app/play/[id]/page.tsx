import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PlayGame from '@/components/PlayGame'

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      missions: {
        include: {
          questions: { orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!game) redirect('/')

  // Gather all questions from missions
  const questions = game.missions.flatMap((m) => m.questions)

  // Parse rules
  let rules = null
  try {
    rules = game.rules ? JSON.parse(game.rules) : null
  } catch {
    rules = null
  }

  const playData = {
    gameId: game.id,
    title: game.title,
    description: game.description,
    rules,
    questions: questions.map((q) => ({
      id: q.id,
      order: q.order,
      text: q.text,
      options: safeParse(q.options),
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
    })),
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md">
          <div className="text-4xl mb-3">🚧</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Soal Belum Siap</h1>
          <p className="text-gray-600 text-sm">
            Guru belum membuat soal untuk game ini. Coba lagi nanti ya, Detektif!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <PlayGame game={playData} />
    </div>
  )
}

function safeParse(str: string | null | undefined): Record<string, string> {
  if (!str) return {}
  try {
    return JSON.parse(str)
  } catch {
    return {}
  }
}
