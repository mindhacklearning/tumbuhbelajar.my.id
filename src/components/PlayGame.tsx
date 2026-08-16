"use client"

import { useState, useEffect, useRef } from 'react'

export interface PlayQuestion {
  id: string
  order: number
  type: string
  text: string
  options: Record<string, string>
  correctAnswer: string
  correctAnswers: string[]
  pairs: { left: string; right: string }[]
  steps: string[]
  explanation: string
}

export interface PlayGameData {
  gameId: string
  title: string
  description: string | null
  rules: {
    wrongAnswer: string
    wrongPenaltyValue: number
    timePerQuestion: number
    customRules: string
  } | null
  questions: PlayQuestion[]
}

const TYPE_LABELS: Record<string, string> = {
  PG: 'Pilihan Ganda',
  BENAR_SALAH: 'Benar / Salah',
  PG_KOMPLEKS: 'PG Kompleks',
  NUMERIK: 'Jawaban Angka',
  ISIAN: 'Isian Singkat',
  MENJODOHKAN: 'Menjodohkan',
  URUTAN: 'Mengurutkan',
}

export default function PlayGame({ game }: { game: PlayGameData }) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [current, setCurrent] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [position, setPosition] = useState(0)
  const [penalty, setPenalty] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [multiSelected, setMultiSelected] = useState<string[]>([])
  const [textInput, setTextInput] = useState('')
  const [numInput, setNumInput] = useState('')
  const [matchInput, setMatchInput] = useState<Record<string, string>>({})
  const [orderInput, setOrderInput] = useState<string[]>([])
  const [feedback, setFeedback] = useState<null | { correct: boolean; msg: string }>(null)
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const question = game.questions[current]
  const timePerQuestion = game.rules?.timePerQuestion || 0
  const wrongType = game.rules?.wrongAnswer || 'MUNDUR_LANGKAH'
  const penaltyVal = game.rules?.wrongPenaltyValue || 1
  const qtype = question?.type || 'PG'

  useEffect(() => {
    if (phase !== 'playing' || !timePerQuestion || feedback || selected || multiSelected.length > 0) return
    setTimeLeft(timePerQuestion)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleSubmit('', true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, current, feedback, selected, multiSelected, timePerQuestion])

  // Initialize order input with shuffled steps
  useEffect(() => {
    if (qtype === 'URUTAN' && question?.steps && orderInput.length === 0) {
      setOrderInput([...question.steps].sort(() => Math.random() - 0.5))
    }
  }, [current])

  function evaluate(choice: string, isTimeout = false): boolean {
    if (!question) return false
    switch (qtype) {
      case 'BENAR_SALAH':
        return !isTimeout && choice === question.correctAnswer
      case 'NUMERIK':
        if (isTimeout || !choice) return false
        return choice.trim().replace(',', '.') === question.correctAnswer.trim().replace(',', '.')
      case 'ISIAN':
        if (isTimeout || !choice) return false
        return choice.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
      case 'PG_KOMPLEKS': {
        if (isTimeout) return false
        const correctSet = new Set(question.correctAnswers)
        const chosenSet = new Set(choice.split(',').filter(Boolean))
        return (
          correctSet.size === chosenSet.size &&
          [...correctSet].every((c) => chosenSet.has(c))
        )
      }
      case 'MENJODOHKAN': {
        if (isTimeout) return false
        const pairs = question.pairs || []
        const answerMap = new Map(pairs.map((p) => [p.left, p.right]))
        const correct = pairs.every((p) => matchInput[p.left] === p.right)
        return correct && Object.keys(matchInput).length === pairs.length
      }
      case 'URUTAN': {
        if (isTimeout) return false
        const correctOrder = question.correctAnswer.split(',').map((s) => s.trim())
        const indexMap = new Map<string, number>()
        ;(question.steps || []).forEach((s, i) => indexMap.set(s, i + 1))
        const myOrder = orderInput.map((s) => String(indexMap.get(s) || 0))
        return JSON.stringify(myOrder) === JSON.stringify(correctOrder)
      }
      default:
        // PG
        return !isTimeout && choice === question.correctAnswer
    }
  }

  function handleSubmit(choice: string, isTimeout = false) {
    if (feedback) return
    if (!question) return

    const correct = evaluate(choice, isTimeout)
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    setBestStreak((b) => Math.max(b, newStreak))
    if (correct) {
      setCorrectCount((c) => c + 1)
      setPosition((p) => Math.min(15, p + 1))
      setFeedback({ correct: true, msg: '✅ Benar! +1 langkah' })
    } else {
      setWrongQuestions((w) => [...w, question.order])
      if (wrongType === 'MUNDUR_LANGKAH') {
        setPosition((p) => Math.max(0, p - penaltyVal))
        setFeedback({ correct: false, msg: `❌ Tilang! Mundur ${penaltyVal} langkah` })
      } else if (wrongType === 'BERHENTI_DETIK') {
        setPenalty(penaltyVal)
        setFeedback({ correct: false, msg: `⏸️ Tilang! Berhenti ${penaltyVal} detik` })
      } else if (wrongType === 'KEHILANGAN_POIN') {
        setCorrectCount((c) => Math.max(0, c - penaltyVal))
        setFeedback({ correct: false, msg: `💔 Tilang! Kehilangan ${penaltyVal} poin` })
      } else {
        setFeedback({ correct: false, msg: '❌ Salah. Coba lagi!' })
      }
    }

    const wait = wrongType === 'BERHENTI_DETIK' && !correct ? 1800 + penaltyVal * 1000 : 1800
    setTimeout(() => {
      setSelected(null)
      setMultiSelected([])
      setTextInput('')
      setNumInput('')
      setMatchInput({})
      setOrderInput([])
      setFeedback(null)
      setPenalty(0)
      if (current + 1 < game.questions.length) {
        setCurrent((c) => c + 1)
      } else {
        setPhase('done')
      }
    }, wait)
  }

  function submitMulti() {
    if (multiSelected.length === 0) return
    handleSubmit(multiSelected.join(','))
  }

  function submitText() {
    if (!textInput.trim()) return
    handleSubmit(textInput)
  }

  function submitNum() {
    if (!numInput.trim()) return
    handleSubmit(numInput)
  }

  function submitMatch() {
    const pairs = question?.pairs || []
    if (Object.keys(matchInput).length < pairs.length) return
    handleSubmit('matched')
  }

  function submitOrder() {
    if (orderInput.length < (question?.steps?.length || 0)) return
    handleSubmit('ordered')
  }

  const progress = Math.round((current / game.questions.length) * 100)

  // ===== INTRO =====
  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🕵️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{game.title}</h1>
          {game.description && <p className="text-gray-600 mb-6">{game.description}</p>}

          <div className="text-left bg-gray-50 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm">📜 Peraturan Game</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>🎯 Jawab {game.questions.length} soal berbagai model</li>
              <li>🚶 Jawaban benar = maju 1 langkah di peta</li>
              {wrongType === 'MUNDUR_LANGKAH' && <li>🚗 Jawaban salah = <b>tilang, mundur {penaltyVal} langkah</b></li>}
              {wrongType === 'BERHENTI_DETIK' && <li>⏸️ Jawaban salah = <b>tilang, berhenti {penaltyVal} detik</b></li>}
              {wrongType === 'KEHILANGAN_POIN' && <li>💔 Jawaban salah = <b>kehilangan {penaltyVal} poin</b></li>}
              {wrongType === 'BEBAS' && <li>🙂 Jawaban salah tidak dihukum</li>}
              {timePerQuestion > 0 && <li>⏱️ Waktu per soal: <b>{timePerQuestion} detik</b></li>}
            </ul>
            {game.rules?.customRules && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 whitespace-pre-line">
                ✍️ {game.rules.customRules}
              </div>
            )}
          </div>

          <button
            onClick={() => { setPhase('playing'); setTimeLeft(timePerQuestion) }}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
          >
            🚀 Mulai Bermain
          </button>
        </div>
      </div>
    )
  }

  // ===== DONE =====
  if (phase === 'done') {
    const score = Math.round((correctCount / game.questions.length) * 100)
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">{score >= 80 ? '🏆' : score >= 60 ? '🎉' : '💪'}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Selesai!</h1>
          <p className="text-gray-500 mb-6">Hasil permainan detektif kamu</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-700">{correctCount}/{game.questions.length}</div>
              <div className="text-sm text-gray-500 mt-1">Benar</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-700">{score}%</div>
              <div className="text-sm text-gray-500 mt-1">Skor</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-700">{bestStreak}×</div>
              <div className="text-sm text-gray-500 mt-1">Streak Terbaik</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-amber-700">{position}/15</div>
              <div className="text-sm text-gray-500 mt-1">Langkah Maju</div>
            </div>
          </div>

          {wrongQuestions.length > 0 && (
            <div className="text-left bg-red-50 rounded-xl p-4 mb-6">
              <div className="font-medium text-red-800 text-sm mb-2">📋 Soal yang perlu dipelajari lagi:</div>
              <div className="flex flex-wrap gap-2">
                {wrongQuestions.map((n) => (
                  <span key={n} className="bg-white text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-full">Soal {n}</span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setPhase('intro'); setCurrent(0); setCorrectCount(0); setStreak(0)
              setBestStreak(0); setPosition(0); setWrongQuestions([])
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            🔄 Main Lagi
          </button>
        </div>
      </div>
    )
  }

  // ===== PLAYING =====
  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Soal {current + 1} / {game.questions.length}</span>
          <span className="font-medium text-blue-600">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="flex items-center gap-1 text-gray-600">🚩 <b>{position}</b>/15 langkah</span>
          <span className="flex items-center gap-1 text-gray-600">🔥 Streak: <b className={streak >= 3 ? 'text-orange-500' : ''}>{streak}×</b></span>
          {timePerQuestion > 0 && !feedback && (
            <span className={`font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>⏱ {timeLeft}s</span>
          )}
          {penalty > 0 && !feedback && <span className="font-bold text-red-500 animate-pulse">⏸️ {penalty}s</span>}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-400">Soal {question.order}</div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
            {TYPE_LABELS[qtype] || qtype}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-5 leading-relaxed">{question.text}</h2>

        {/* PG / BENAR_SALAH */}
        {(qtype === 'PG' || qtype === 'BENAR_SALAH') && (
          <div className="space-y-3">
            {Object.entries(question.options || {}).map(([key, val]) => {
              let style = 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              if (selected) {
                if (key === question.correctAnswer) style = 'border-green-500 bg-green-50'
                else if (key === selected) style = 'border-red-500 bg-red-50'
                else style = 'border-gray-200 opacity-60'
              }
              return (
                <button key={key} disabled={!!selected} onClick={() => { setSelected(key); handleSubmit(key) }}
                  className={`w-full text-left border-2 rounded-xl px-4 py-3 transition disabled:cursor-default ${style}`}>
                  <span className="font-bold text-gray-700 mr-2">{key}.</span>
                  <span className="text-gray-800">{val}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* PG_KOMPLEKS */}
        {qtype === 'PG_KOMPLEKS' && (
          <div>
            <div className="space-y-3">
              {Object.entries(question.options || {}).map(([key, val]) => (
                <label key={key}
                  className={`flex items-start gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition ${multiSelected.includes(key) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input
                    type="checkbox"
                    checked={multiSelected.includes(key)}
                    disabled={!!feedback}
                    onChange={() => setMultiSelected((prev) =>
                      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
                    )}
                    className="mt-1 w-4 h-4 accent-blue-600"
                  />
                  <span className="text-gray-800"><b className="mr-1">{key}.</b>{val}</span>
                </label>
              ))}
            </div>
            <button
              onClick={submitMulti}
              disabled={multiSelected.length === 0 || !!feedback}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              ✅ Kunci Jawaban ({multiSelected.length} dipilih)
            </button>
            {!feedback && (
              <p className="text-xs text-gray-400 mt-2 text-center">Pilih SEMUA jawaban yang benar</p>
            )}
          </div>
        )}

        {/* NUMERIK */}
        {qtype === 'NUMERIK' && (
          <div>
            <input
              type="text"
              inputMode="decimal"
              value={numInput}
              disabled={!!feedback}
              onChange={(e) => setNumInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNum()}
              placeholder="Ketik jawaban angka..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-xl text-center font-semibold focus:border-blue-500 outline-none text-gray-900"
            />
            <button
              onClick={submitNum}
              disabled={!numInput.trim() || !!feedback}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              ✅ Kunci Jawaban
            </button>
          </div>
        )}

        {/* ISIAN */}
        {qtype === 'ISIAN' && (
          <div>
            <input
              type="text"
              value={textInput}
              disabled={!!feedback}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitText()}
              placeholder="Ketik jawaban singkat..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:border-blue-500 outline-none text-gray-900"
            />
            <button
              onClick={submitText}
              disabled={!textInput.trim() || !!feedback}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              ✅ Kunci Jawaban
            </button>
          </div>
        )}

        {/* MENJODOHKAN */}
        {qtype === 'MENJODOHKAN' && (
          <div>
            <div className="space-y-3">
              {(question.pairs || []).map((pair) => (
                <div key={pair.left} className="flex items-center gap-3">
                  <span className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium">
                    {pair.left}
                  </span>
                  <span className="text-gray-400">⇄</span>
                  <select
                    value={matchInput[pair.left] || ''}
                    disabled={!!feedback}
                    onChange={(e) => setMatchInput((m) => ({ ...m, [pair.left]: e.target.value }))}
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:border-blue-500 outline-none text-gray-800"
                  >
                    <option value="">— Pilih —</option>
                    {(question.pairs || []).map((p) => (
                      <option key={p.right} value={p.right}>{p.right}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={submitMatch}
              disabled={Object.keys(matchInput).length < (question.pairs || []).length || !!feedback}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              ✅ Kunci Jawaban
            </button>
          </div>
        )}

        {/* URUTAN */}
        {qtype === 'URUTAN' && (
          <div>
            <p className="text-sm text-gray-500 mb-3">Susun urutan yang benar (dari atas = urutan 1):</p>
            <div className="space-y-2">
              {orderInput.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800">
                    {step}
                  </span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        if (i === 0) return
                        const arr = [...orderInput]
                        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
                        setOrderInput(arr)
                      }}
                      disabled={!!feedback || i === 0}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 text-sm"
                    >↑</button>
                    <button
                      onClick={() => {
                        if (i === orderInput.length - 1) return
                        const arr = [...orderInput]
                        ;[arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]
                        setOrderInput(arr)
                      }}
                      disabled={!!feedback || i === orderInput.length - 1}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 text-sm"
                    >↓</button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={submitOrder}
              disabled={orderInput.length < (question.steps || []).length || !!feedback}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              ✅ Kunci Jawaban
            </button>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`mt-4 rounded-xl p-4 text-sm font-medium animate-pulse ${feedback.correct ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {feedback.msg}
            {!feedback.correct && question.explanation && (
              <div className="mt-2 text-xs font-normal text-gray-600">💡 {question.explanation}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
