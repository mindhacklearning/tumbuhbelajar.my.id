import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export default async function GamesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Find teacher record for this user
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  })

  if (!teacher) {
    return (
      <Shell>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">👩‍🏫</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Akun Guru Belum Aktif</h1>
          <p className="text-gray-600 mb-4">
            Akun kamu belum terdaftar sebagai guru. Hubungi admin untuk aktivasi.
          </p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </Shell>
    )
  }

  const games = await prisma.game.findMany({
    where: { teacherId: teacher.id },
    include: {
      missions: { select: { id: true, title: true, _count: { select: { questions: true } } } },
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Game Detektif</h1>
          <p className="text-gray-600 mt-1">Kelola game pembelajaran matematika kamu</p>
        </div>
        <Link
          href="/dashboard/games/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium"
        >
          + Buat Game
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Game</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Buat game pertama kamu! Pilih bab & sub-bab matematika, dan AI akan
            membuatkan soalnya secara otomatis.
          </p>
          <Link
            href="/dashboard/games/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            Buat Game Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {games.map((game) => {
            const totalQuestions = game.missions.reduce(
              (sum, m) => sum + m._count.questions,
              0
            )
            return (
              <div
                key={game.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                      🎮
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{game.title}</h3>
                      <p className="text-sm text-gray-500">{game.category || game.topic}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      game.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {game.status === 'PUBLISHED' ? 'Terbit' : 'Draf'}
                  </span>
                </div>

                <div className="flex gap-4 text-sm text-gray-600 mb-4">
                  <span>📝 {totalQuestions} soal</span>
                  <span>🎯 {game.difficulty}</span>
                  <span>📊 {game._count.attempts} percobaan</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/games/${game.id}`}
                    className="flex-1 text-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    Kelola
                  </Link>
                  <Link
                    href={`/play/${game.id}`}
                    className="flex-1 text-center border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Mainkan
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TumbuhBelajar</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition text-sm">
              Dashboard
            </Link>
            <Link href="/api/auth/signout" className="text-gray-600 hover:text-red-600 transition text-sm">
              Keluar
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
    </div>
  )
}
