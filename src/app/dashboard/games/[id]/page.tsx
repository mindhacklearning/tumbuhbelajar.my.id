import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateTeacher } from '@/lib/teacher'
import GameMap from '@/components/GameMap'
import RulesEditor from '@/components/RulesEditor'
import GenerateQuestionsButton from './GenerateQuestionsButton'

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const teacher = await getOrCreateTeacher(session.user.id)
  if (!teacher) redirect('/dashboard/games')

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

  if (!game || game.teacherId !== teacher.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Game tidak ditemukan</h1>
          <Link href="/dashboard/games" className="text-blue-600 hover:underline">
            ← Kembali ke Daftar Game
          </Link>
        </div>
      </div>
    )
  }

  const subTopics = safeParse(game.subTopics) as string[]
  const objectives = safeParse(game.learningObjectives) as string[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/dashboard/games" className="text-blue-600 hover:underline text-sm">
          ← Daftar Game
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mt-4 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-blue-600 font-medium mb-1">{game.category}</div>
              <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
              {game.description && (
                <p className="text-gray-600 mt-2">{game.description}</p>
              )}
            </div>
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-medium shrink-0 ${
                game.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {game.status === 'PUBLISHED' ? 'Terbit' : 'Draf'}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-gray-500">Kelas</div>
              <div className="font-semibold text-gray-900 mt-1">
                Kelas {game.category?.match(/Kelas\s*(\d)/)?.[1] || '-'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-gray-500">Kesulitan</div>
              <div className="font-semibold text-gray-900 mt-1">{game.difficulty}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-gray-500">Soal</div>
              <div className="font-semibold text-gray-900 mt-1">
                {game.missions.reduce((s, m) => s + m.questions.length, 0)} soal
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Sub-Bab</h3>
            <div className="flex flex-wrap gap-2">
              {subTopics.length > 0 ? (
                subTopics.map((st) => (
                  <span key={st} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                    {st}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">Belum ada sub-bab dipilih</span>
              )}
            </div>
          </div>

          {objectives.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tujuan Pembelajaran</h3>
              <ul className="space-y-1.5">
                {objectives.map((o, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-blue-500 shrink-0">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Preview & Live buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/play/${game.id}`}
            className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl font-semibold text-center hover:bg-green-700 transition"
          >
            🎮 Preview Game (Coba sebagai Siswa)
          </Link>
          <Link
            href={`/dashboard/games/${game.id}/live`}
            className="flex-1 bg-purple-600 text-white px-6 py-4 rounded-xl font-semibold text-center hover:bg-purple-700 transition"
          >
            📡 Monitor Live Siswa
          </Link>
        </div>

        {/* Game Map */}
        <div className="mt-8">
          <GameMap
            missionCounts={game.missions.map((m) => m.questions.length)}
            totalQuestions={game.missions.reduce((s, m) => s + m.questions.length, 0)}
          />
        </div>

        {/* Rules */}
        <div className="mt-8">
          <RulesEditor gameId={game.id} initialRules={game.rules} />
        </div>

        {/* Generate questions */}
        <div className="mt-8">
          <GenerateQuestionsButton gameId={game.id} />
        </div>

        {/* Missions & questions */}
        <div className="mt-8 space-y-6">
          {game.missions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold text-gray-900 mb-1">Belum Ada Soal</h3>
              <p className="text-gray-500 text-sm mb-4">
                Klik "Generate Soal AI" untuk membuat 15 soal pilihan ganda otomatis
              </p>
            </div>
          ) : (
            game.missions.map((mission) => (
              <div key={mission.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                    <p className="text-sm text-gray-500">{mission.description}</p>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {mission.questions.length} soal
                  </span>
                </div>
                <div className="space-y-2">
                  {mission.questions.map((q) => {
                    const badge = TYPE_BADGES[q.type] || TYPE_BADGES.PG
                    return (
                    <details key={q.id} className="border border-gray-100 rounded-xl">
                      <summary className="px-4 py-3 text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-50 rounded-xl flex items-center justify-between gap-2">
                        <span className="truncate">
                          {q.order}. {q.text}
                        </span>
                        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm">
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {Object.entries(safeParse(q.options) as Record<string, string>).map(
                            ([key, val]) => (
                              <div key={key} className="bg-gray-50 rounded-lg p-2">
                                <span className="font-semibold text-gray-700">{key}.</span>{' '}
                                <span className="text-gray-600">{val}</span>
                              </div>
                            )
                          )}
                        </div>
                        <div className="mt-3 text-green-700">
                          ✅ Jawaban: {q.correctAnswer}
                        </div>
                        <div className="mt-1 text-gray-500">💡 {q.explanation}</div>
                      </div>
                    </details>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

const TYPE_BADGES: Record<string, { label: string; cls: string }> = {
  PG: { label: 'PG', cls: 'bg-blue-50 text-blue-700' },
  BENAR_SALAH: { label: 'B/S', cls: 'bg-purple-50 text-purple-700' },
  PG_KOMPLEKS: { label: 'PG Kompleks', cls: 'bg-indigo-50 text-indigo-700' },
  NUMERIK: { label: 'Angka', cls: 'bg-green-50 text-green-700' },
  ISIAN: { label: 'Isian', cls: 'bg-amber-50 text-amber-700' },
  MENJODOHKAN: { label: 'Menjodohkan', cls: 'bg-pink-50 text-pink-700' },
  URUTAN: { label: 'Urutan', cls: 'bg-cyan-50 text-cyan-700' },
}

function safeParse(str: string | null | undefined): unknown {
  if (!str) return []
  try {
    return JSON.parse(str)
  } catch {
    return []
  }
}

function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BD</span>
          </div>
          <span className="font-bold text-xl text-gray-900">TumbuhBelajar</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard/games" className="text-gray-600 hover:text-blue-600 transition text-sm">
            Games
          </Link>
          <Link href="/api/auth/signout" className="text-gray-600 hover:text-red-600 transition text-sm">
            Keluar
          </Link>
        </nav>
      </div>
    </header>
  )
}
