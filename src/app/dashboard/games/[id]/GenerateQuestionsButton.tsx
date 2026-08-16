"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTION_TYPES, type QuestionType } from '@/lib/ai'

const TYPE_ORDER: QuestionType[] = ['PG', 'BENAR_SALAH', 'PG_KOMPLEKS', 'NUMERIK', 'ISIAN', 'MENJODOHKAN', 'URUTAN']

export default function GenerateQuestionsButton({ gameId }: { gameId: string }) {
  const router = useRouter()
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['PG'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    total: number
    modelUsed?: string
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
    remaining?: number
    learningObjectives?: string[]
  } | null>(null)

  function toggleType(t: QuestionType) {
    setSelectedTypes((prev) => {
      if (prev.includes(t)) {
        // Don't allow empty selection
        if (prev.length === 1) return prev
        return prev.filter((x) => x !== t)
      }
      return [...prev, t]
    })
  }

  async function generate() {
    const typeNames = selectedTypes
      .map((t) => QUESTION_TYPES[t].label)
      .join(', ')
    if (!confirm(`Generate 15 soal dengan model: ${typeNames}? Ini akan memakai kuota AI kamu.`)) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, questionTypes: selectedTypes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal generate soal')

      setResult({
        total: data.total,
        modelUsed: data.modelUsed,
        usage: data.usage,
        remaining: data.remaining,
        learningObjectives: data.learningObjectives,
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">🤖 Generate Soal dengan AI</h3>
          <p className="text-sm text-gray-500 mt-1">
            Pilih model soal — AI membuatkan sesuai pilihan (bisa lebih dari satu)
          </p>
        </div>
      </div>

      {/* Question type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-5">
        {TYPE_ORDER.map((t) => {
          const info = QUESTION_TYPES[t]
          const active = selectedTypes.includes(t)
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`text-left p-3 rounded-xl border transition ${
                active
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className={`text-sm font-medium ${active ? 'text-blue-800' : 'text-gray-800'}`}>
                {info.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{info.desc}</div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">{selectedTypes.length}</span> model dipilih:
          {' '}
          {selectedTypes.map((t) => QUESTION_TYPES[t].label).join(', ')}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ AI Menulis Soal...' : '✨ Generate Soal AI'}
        </button>
      </div>

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm">
          <div className="font-semibold">✅ Berhasil! {result.total} soal dibuat</div>
          <div className="mt-1 text-green-700/90">
            🤖 model: {result.modelUsed}
            {result.usage && (
              <span>
                {' '}· 🔢 token: {result.usage.totalTokens.toLocaleString('id-ID')} dipakai
                (input {result.usage.promptTokens.toLocaleString('id-ID')} + output{' '}
                {result.usage.completionTokens.toLocaleString('id-ID')})
              </span>
            )}
            {typeof result.remaining === 'number' && (
              <span> · ⚡ sisa {result.remaining} generate</span>
            )}
          </div>
          {result.learningObjectives && result.learningObjectives.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="font-semibold mb-1.5">🎯 Tujuan Pembelajaran:</div>
              <ul className="space-y-1">
                {result.learningObjectives.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
