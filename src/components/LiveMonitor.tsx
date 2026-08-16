"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface StudentRow {
  id: string
  studentName: string
  status: string
  score: number | null
  correctCount: number
  wrongCount: number
  total: number
  bestStreak: number
  progress: number
  startedAt: string
  completedAt: string | null
}

interface WrongQuestion {
  order: number
  text: string
  wrongCount: number
  totalCount: number
  wrongRate: number
}

interface LiveData {
  game: { id: string; title: string }
  totalAttempts: number
  activeNow: number
  completed: number
  students: StudentRow[]
  wrongByQuestion: WrongQuestion[]
  updatedAt: string
}

export default function LiveMonitor({ gameId }: { gameId: string }) {
  const [data, setData] = useState<LiveData | null>(null)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const res = await fetch(`/api/games/${gameId}/live`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Gagal memuat data')
        const d = await res.json()
        if (!cancelled) {
          setData(d)
          setLastUpdate(new Date(d.updatedAt).toLocaleTimeString('id-ID'))
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error')
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 5000) // auto-refresh every 5s
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [gameId])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
        ⚠️ {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <div className="text-3xl mb-3">📡</div>
        <p className="text-gray-500">Memuat data live...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📡 Monitor Live: {data.game.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Auto-refresh setiap 5 detik · update terakhir {lastUpdate}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-green-700">{data.activeNow}</div>
              <div className="text-xs text-gray-500">Sedang Mengerjakan</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-blue-700">{data.completed}</div>
              <div className="text-xs text-gray-500">Selesai</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">🏆 Papan Skor Siswa</h3>
        {data.students.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500">Belum ada siswa yang mengerjakan game ini.</p>
            <p className="text-sm text-gray-400 mt-1">
              Bagikan link game ke siswa — data akan muncul otomatis di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Siswa</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-center">Benar</th>
                  <th className="py-2 pr-4 text-center">Salah</th>
                  <th className="py-2 pr-4 text-center">Streak Terbaik</th>
                  <th className="py-2 text-center">Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="py-2.5 pr-4 font-bold text-gray-400">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-gray-800">{s.studentName}</td>
                    <td className="py-2.5 pr-4">
                      {s.completedAt ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Selesai
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 animate-pulse">
                          Mengerjakan...
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-center text-green-600 font-medium">{s.correctCount}</td>
                    <td className="py-2.5 pr-4 text-center text-red-500 font-medium">{s.wrongCount}</td>
                    <td className="py-2.5 pr-4 text-center">
                      <span className={`font-bold ${s.bestStreak >= 3 ? 'text-orange-500' : 'text-gray-600'}`}>
                        {s.bestStreak}×
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-16">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{s.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wrong questions analysis */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Soal Paling Sering Salah</h3>
        {data.wrongByQuestion.length === 0 || data.totalAttempts === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            Data soal akan muncul setelah siswa mulai mengerjakan
          </p>
        ) : (
          <div className="space-y-3">
            {data.wrongByQuestion
              .filter((q) => q.wrongCount > 0)
              .sort((a, b) => b.wrongRate - a.wrongRate)
              .slice(0, 10)
              .map((q) => (
                <div key={q.order} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-xs font-bold text-gray-500">
                    Soal {q.order}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 truncate">{q.text}</span>
                      <span className="text-red-500 font-medium shrink-0 ml-2">
                        {q.wrongCount}/{q.totalCount} salah ({q.wrongRate}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          q.wrongRate >= 60 ? 'bg-red-500' : q.wrongRate >= 30 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${q.wrongRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
