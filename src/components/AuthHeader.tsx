import Link from 'next/link'
import { auth } from '@/auth'

export default async function AuthHeader() {
  const session = await auth()

  return (
    <div className="flex items-center gap-3">
      {session?.user ? (
        <>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {session.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-800 hidden sm:block">
              {session.user.name?.split(' ')[0]}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Dashboard
          </Link>
        </>
      ) : (
        <>
          <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">
            Masuk
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Daftar Gratis
          </Link>
        </>
      )}
    </div>
  )
}
