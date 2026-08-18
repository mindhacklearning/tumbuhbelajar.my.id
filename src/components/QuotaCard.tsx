"use client"

import { useEffect, useState } from 'react'

interface QuotaInfo {
  plan: string
  planName: string
  marketing: {
    tokenLabel: string
    gamePerMonth: number
    analysisPerMonth: number
    rppPerMonth: number
  }
  quota: {
    game: { used: number; limit: number }
    analysis: { used: number; limit: number }
    rpp: { used: number; limit: number }
  }
  subscriptionEnd: string | null
}

export default function QuotaCard() {
  const [data, setData] = useState<QuotaInfo | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/teacher/quota', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError('Gagal memuat kuota'))
  }, [])

  if (error) return null
  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-100 rounded mb-2"></div>
        <div className="h-8 bg-gray-100 rounded"></div>
      </div>
    )
  }

  const items = [
    { key: 'game', label: '🎮 Buat Game', used: data.quota.game.used, limit: data.quota.game.limit },
    { key: 'analysis', label: '📊 Analisis Kelas', used: data.quota.analysis.used, limit: data.quota.analysis.limit },
    { key: 'rpp', label: '📄 RPP/LKPD', used: data.quota.rpp.used, limit: data.quota.rpp.limit },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">⚡ Kuota Bulanan</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Paket {data.planName} · {data.marketing.tokenLabel}
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium">
          {data.plan}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const pct = item.limit > 0 ? Math.round((item.used / item.limit) * 100) : 0
          const exhausted = item.used >= item.limit
          return (
            <div key={item.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{item.label}</span>
                <span className={exhausted ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                  {item.used}/{item.limit}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    exhausted ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              {exhausted && (
                <p className="text-xs text-red-600 mt-1">
                  Kuota habis — upgrade paket atau tunggu bulan depan
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
