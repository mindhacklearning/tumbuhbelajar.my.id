import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user
  const firstName = user.name?.split(' ')[0] || 'Guru'

  const features = [
    {
      icon: '🎮',
      title: 'Buat Game Detektif',
      desc: 'Buat game baru, pilih topik, generate soal dengan AI',
      href: '/dashboard/games',
      status: 'Segera',
      ready: false,
    },
    {
      icon: '👥',
      title: 'Kelola Kelas',
      desc: 'Buat kelas, undang siswa dengan kode, atur anggota',
      href: '/dashboard/classes',
      status: 'Segera',
      ready: false,
    },
    {
      icon: '📊',
      title: 'Analytics & N-Gain',
      desc: 'Lihat progress siswa, N-Gain, kekuatan & kelemahan',
      href: '/dashboard/analytics',
      status: 'Segera',
      ready: false,
    },
    {
      icon: '🤖',
      title: 'AI Document Generator',
      desc: 'Generate RPP, LKPD, dan rubrik penilaian otomatis',
      href: '/dashboard/documents',
      status: 'Segera',
      ready: false,
    },
    {
      icon: '💳',
      title: 'Langganan',
      desc: 'Kelola paket Starter, Pro, atau Premium',
      href: '/dashboard/subscription',
      status: 'Segera',
      ready: false,
    },
    {
      icon: '📝',
      title: 'Soal TKA',
      desc: 'Kelola bank soal, generate soal baru dengan AI',
      href: '/dashboard/questions',
      status: 'Segera',
      ready: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TumbuhBelajar.my.id</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition text-sm">
              Beranda
            </Link>
            <Link
              href="/api/auth/signout"
              className="text-gray-600 hover:text-red-600 transition text-sm"
            >
              Keluar
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Selamat datang, {firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {user.email} · Akun {user.role === 'TEACHER' ? 'Guru' : 'Siswa'}
              </p>
            </div>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            💡 <strong>Mode Demo:</strong> Fitur-fitur sedang dalam pengembangan dan akan
            aktif satu per satu. Mulai dari <strong>Buat Game</strong> dan{' '}
            <strong>Kelola Kelas</strong>.
          </div>
        </div>

        {/* Features grid */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fitur</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{f.desc}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                  {f.status}
                </span>
                <Link
                  href={f.href}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Buka →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
