"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface GameRules {
  wrongAnswer: string // MUNDUR_LANGKAH | BERHENTI_DETIK | KEHILANGAN_POIN | BEBAS
  wrongPenaltyValue: number // steps or seconds
  timePerQuestion: number // seconds, 0 = unlimited
  maxWrongBeforeRestart?: number // 0 = no limit
  customRules: string // free text rule
}

const DEFAULT_RULES: GameRules = {
  wrongAnswer: 'MUNDUR_LANGKAH',
  wrongPenaltyValue: 1,
  timePerQuestion: 30,
  maxWrongBeforeRestart: 0,
  customRules: '',
}

const WRONG_OPTIONS = [
  {
    value: 'MUNDUR_LANGKAH',
    label: '🚗 Tilang: Mundur 1 Langkah',
    desc: 'Jawaban salah = mundur 1 posisi di peta (bisa diatur jumlah langkah)',
  },
  {
    value: 'BERHENTI_DETIK',
    label: '⏸️ Tilang: Berhenti Beberapa Detik',
    desc: 'Jawaban salah = kena tilang, berhenti dulu (bisa dikejar pemain lain!)',
  },
  {
    value: 'KEHILANGAN_POIN',
    label: '💔 Tilang: Kehilangan Poin',
    desc: 'Jawaban salah = poin berkurang (bisa minus)',
  },
  {
    value: 'BEBAS',
    label: '🙂 Bebas (Tanpa Hukuman)',
    desc: 'Jawaban salah tidak dihukum, cocok untuk latihan santai',
  },
]

export default function RulesEditor({ gameId, initialRules }: { gameId: string; initialRules?: string | null }) {
  const router = useRouter()
  const [rules, setRules] = useState<GameRules>(() => {
    if (initialRules) {
      try {
        return { ...DEFAULT_RULES, ...JSON.parse(initialRules) }
      } catch {
        return DEFAULT_RULES
      }
    }
    return DEFAULT_RULES
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/games/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, rules }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan peraturan')
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">⚖️ Peraturan Game</h3>
        <span className="text-xs text-gray-400">Simpan sebelum mencoba preview</span>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Atur konsekuensi jawaban salah ("tilang") dan batas waktu — bisa disesuaikan bebas
      </p>

      {/* Wrong answer penalty */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Saat Jawaban Salah (Tilang)
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          {WRONG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRules({ ...rules, wrongAnswer: opt.value })}
              className={`text-left p-3 rounded-xl border transition ${
                rules.wrongAnswer === opt.value
                  ? 'border-red-400 bg-red-50 ring-2 ring-red-100'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="font-medium text-gray-900 text-sm">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Penalty value */}
      {(rules.wrongAnswer === 'MUNDUR_LANGKAH' || rules.wrongAnswer === 'BERHENTI_DETIK') && (
        <div className="mb-5 bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {rules.wrongAnswer === 'MUNDUR_LANGKAH'
              ? 'Berapa langkah mundur?'
              : 'Berapa detik berhenti?'}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRules({ ...rules, wrongPenaltyValue: Math.max(1, rules.wrongPenaltyValue - 1) })}
              className="w-10 h-10 rounded-xl border border-gray-300 text-lg font-bold hover:bg-gray-100"
            >
              −
            </button>
            <span className="text-2xl font-bold text-gray-900 w-12 text-center">
              {rules.wrongPenaltyValue}
            </span>
            <button
              type="button"
              onClick={() => setRules({ ...rules, wrongPenaltyValue: Math.min(10, rules.wrongPenaltyValue + 1) })}
              className="w-10 h-10 rounded-xl border border-gray-300 text-lg font-bold hover:bg-gray-100"
            >
              +
            </button>
            <span className="text-sm text-gray-500 ml-2">
              {rules.wrongAnswer === 'MUNDUR_LANGKAH' ? 'langkah mundur' : 'detik freeze'}
            </span>
          </div>
        </div>
      )}

      {/* Time per question */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Waktu per Soal (detik)
        </label>
        <div className="flex items-center gap-3">
          <select
            value={rules.timePerQuestion}
            onChange={(e) => setRules({ ...rules, timePerQuestion: Number(e.target.value) })}
            className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value={0}>Tanpa batas</option>
            <option value={15}>15 detik (sprint)</option>
            <option value={30}>30 detik (normal)</option>
            <option value={45}>45 detik (santai)</option>
            <option value={60}>60 detik (lama)</option>
          </select>
          <span className="text-xs text-gray-400">
            {rules.timePerQuestion === 0 ? 'Siswa bebas berpikir' : 'Habis waktu = dianggap salah'}
          </span>
        </div>
      </div>

      {/* Custom rules */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ✍️ Aturan Tambahan (bebas tulis)
        </label>
        <textarea
          value={rules.customRules}
          onChange={(e) => setRules({ ...rules, customRules: e.target.value })}
          rows={3}
          placeholder={'Contoh:\n- Pemain dengan 3 jawaban benar berturut-turut mendapat bonus +5 poin\n- Jika semua jawaban benar tanpa salah, dapat bintang detektif'}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
        />
        <p className="text-xs text-gray-400 mt-1">
          Aturan ini akan ditampilkan ke siswa sebelum game dimulai
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className={`px-6 py-2.5 rounded-xl font-medium transition ${
          saved
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-50`}
      >
        {saving ? 'Menyimpan...' : saved ? '✓ Tersimpan!' : '💾 Simpan Peraturan'}
      </button>
    </div>
  )
}
