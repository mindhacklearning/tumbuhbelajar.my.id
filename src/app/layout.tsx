import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'TumbuhBelajar.my.id - Game Edukasi Matematika SMP',
  description: 'Platform game edukasi Matematika SMP berbasis AI. Siswa belajar dengan bermain, guru mendapatkan analytics otomatis.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
