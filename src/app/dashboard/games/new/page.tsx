"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MATH_CURRICULUM } from '@/lib/curriculum'

const DIFFICULTIES = [
  { value: 'EASY', label: 'Mudah', desc: 'Soal dasar & pengenalan konsep' },
  { value: 'MEDIUM', label: 'Sedang', desc: 'Soal pemahaman & aplikasi' },
  { value: 'HARD', label: 'Sulit', desc: 'Soal analisis & pemecahan masalah' },
  { value: 'MIXED', label: 'Campuran', desc: '40% mudah, 40% sedang, 20% sulit' },
]

export default function NewGamePage() {
  const router = useRouter()
  const [kelas, setKelas] = useState('8')
  const [selectedBab, setSelectedBab] = useState('')
  const [selectedSubBabs, setSelectedSubBabs] = useState<string[]>([])
  const [tujuan, setTujuan] = useState('')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiIdeas, setAiIdeas] = useState<{ title: string; description: string }[]>([])
  const [aiIdeasLoading, setAiIdeasLoading] = useState(false)
  const [aiIdeasError, setAiIdeasError] = useState('')

  const babList = MATH_CURRICULUM.filter((b) => b.kelas === Number(kelas))
  const selectedBabData = babList.find((b) => b.id === selectedBab)

  function toggleSubBab(name: string) {
    setSelectedSubBabs((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    )
  }

  async function generateIdeas() {
    if (!selectedBabData) return
    setAiIdeasLoading(true)
    setAiIdeasError('')
    try {
      const res = await fetch('/api/ai/generate-game-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kelas: Number(kelas),
          category: selectedBabData.bab,
          subTopics: selectedSubBabs,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal generate ide')
      setAiIdeas(data.options || [])
    } catch (err) {
      setAiIdeasError(err instanceof Error ? err.message : 'Gagal generate ide. Coba lagi.')
    } finally {
      setAiIdeasLoading(false)
    }
  }

  function applyIdea(idea: { title: string; description: string }) {
    setTitle(idea.title)
    setDescription(idea.description)
    setAiIdeas([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/teacher/me', { cache: 'no-store' })
      if (!res.ok) throw new Error('Sesi login tidak ditemukan. Silakan login ulang.')
      const { teacher } = await res.json()

      const objectives = tujuan
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)

      const gameRes = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacher.id,
          title,
          description,
          category: selectedBabData?.bab || '',
          topic: selectedBabData?.bab.replace(/^Bab \d+:\s*/, '') || title,
          subTopics: selectedSubBabs,
          learningObjectives: objectives,
          difficulty,
        }),
      })

      const data = await gameRes.json()
      if (!gameRes.ok) throw new Error(data.error || 'Gagal membuat game')

      router.push(`/dashboard/games/${data.game.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TumbuhBelajar</span>
          </Link>
          <Link href="/dashboard/games" className="text-gray-600 hover:text-blue-600 transition text-sm">
            ← Daftar Game
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Buat Game Detektif</h1>
          <p className="text-gray-600 mt-1">
            Pilih bab & sub-bab, tulis tujuan pembelajaran, lalu AI akan membuatkan soalnya
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Info dasar */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-semibold text-gray-900">1. Info Dasar</h2>
              <button
                type="button"
                onClick={generateIdeas}
                disabled={aiIdeasLoading || !selectedBab}
                className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiIdeasLoading ? '⏳ AI Berpikir...' : '✨ Ide Judul AI'}
              </button>
            </div>
            {!selectedBab && (
              <p className="text-xs text-gray-400 -mt-2 mb-3">
                Pilih bab di bagian 2 dulu, lalu AI bisa buatkan judul & deskripsi
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Game <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Detektif Pythagoras"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cerita singkat untuk misi detektif..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                />
              </div>
            </div>

            {/* AI idea suggestions */}
            {aiIdeas.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  💡 Pilih ide dari AI:
                </h3>
                <div className="space-y-3">
                  {aiIdeas.map((idea, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyIdea(idea)}
                      className="w-full text-left border border-purple-200 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50 transition group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-purple-800">
                            {idea.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {idea.description}
                          </div>
                        </div>
                        <span className="text-purple-600 text-sm font-medium shrink-0">
                          Pakai →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {aiIdeasError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                ⚠️ {aiIdeasError}
              </div>
            )}
          </section>

          {/* Step 2: Kategori & Bab */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">2. Kategori & Bab</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                <select
                  value={kelas}
                  onChange={(e) => {
                    setKelas(e.target.value)
                    setSelectedBab('')
                    setSelectedSubBabs([])
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bab / Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedBab}
                  onChange={(e) => {
                    setSelectedBab(e.target.value)
                    setSelectedSubBabs([])
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">— Pilih Bab —</option>
                  {babList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bab}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Step 3: Sub-bab */}
          {selectedBabData && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-1">3. Sub-Bab</h2>
              <p className="text-sm text-gray-500 mb-4">Pilih satu atau lebih sub-bab</p>
              <div className="flex flex-wrap gap-2">
                {selectedBabData.subBabs.map((sb) => (
                  <button
                    key={sb.name}
                    type="button"
                    onClick={() => toggleSubBab(sb.name)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                      selectedSubBabs.includes(sb.name)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {sb.name}
                  </button>
                ))}
              </div>
              {selectedSubBabs.length > 0 && (
                <p className="text-sm text-blue-700 mt-3">
                  ✓ {selectedSubBabs.length} sub-bab dipilih
                </p>
              )}
            </section>
          )}

          {/* Step 4: Tujuan Pembelajaran */}
          {selectedBabData && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-1">4. Tujuan Pembelajaran</h2>
              <p className="text-sm text-gray-500 mb-4">
                Tulis satu tujuan per baris — dipakai AI untuk membuat soal yang tepat
              </p>
              <textarea
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                rows={4}
                placeholder={`Contoh:
Peserta didik dapat menerapkan Teorema Pythagoras untuk menghitung panjang sisi segitiga siku-siku.
Peserta didik dapat menyelesaikan masalah kontekstual menggunakan tripel Pythagoras.`}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </section>
          )}

          {/* Step 5: Kesulitan */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">5. Tingkat Kesulitan</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`text-left p-4 rounded-xl border transition ${
                    difficulty === d.value
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{d.label}</div>
                  <div className="text-sm text-gray-500">{d.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !title || !selectedBab || selectedSubBabs.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Membuat Game...' : '🚀 Buat Game & Generate Soal AI'}
          </button>
        </form>
      </main>
    </div>
  )
}
