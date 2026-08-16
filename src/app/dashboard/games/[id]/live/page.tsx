import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getOrCreateTeacher } from '@/lib/teacher'
import LiveMonitor from '@/components/LiveMonitor'

export default async function LivePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const teacher = await getOrCreateTeacher(session.user.id)
  if (!teacher) redirect('/dashboard/games')

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TumbuhBelajar</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href={`/dashboard/games/${id}`} className="text-gray-600 hover:text-blue-600 transition text-sm">
              ← Detail Game
            </Link>
            <Link href="/api/auth/signout" className="text-gray-600 hover:text-red-600 transition text-sm">
              Keluar
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <LiveMonitor gameId={id} />
      </main>
    </div>
  )
}
