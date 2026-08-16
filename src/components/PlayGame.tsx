"use client"

import { useMemo, useState, useEffect, useRef } from 'react'

export interface PlayQuestion {
  id: string
  order: number
  text: string
  options: Record<string, string>
  correctAnswer: string
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

const MISSION_STEPS = 15 // 15 soal = 15 langkah di peta

export default function PlayGame({ game }: { game: PlayGameData }) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [current, setCurrent] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [position, setPosition] = useState(0) // posisi di peta (0..15)
  const [penalty, setPenalty] = useState(0) // sedang kena tilang (mundur/freeze)
  const [timeLeft, setTimeLeft] = useState(game.rules?.timePerQuestion || 0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<null | { correct: boolean; msg: string }>(null)
  const [answers, setAnswers] = useState<{ q: number; correct: boolean }[]>([])
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const question = game.questions[current]
  const timePerQuestion = game.rules?.timePerQuestion || 0
  const wrongType = game.rules?.wrongAnswer || 'MUNDUR_LANGKAH'
  const penaltyVal = game.rules?.wrongPenaltyValue || 1

  useEffect(() => {
    if (phase !== 'playing' || !timePerQuestion || feedback || selected) return
    setTimeLeft(timePerQuestion)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          // timeout = wrong
          handleAnswer('', true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, current, feedback, selected, timePerQuestion])

  function handleAnswer(choice: string, isTimeout = false) {
    if (feedback) return
    if (!question) return

    const correct = !isTimeout && choice === question.correctAnswer
    const newStreak = correct ? streak + 1 : 0
    const newAnswers = [...answers, { q: question.order, correct }]

    setSelected(choice)
    setStreak(newStreak)
    setBestStreak((b) => Math.max(b, newStreak))
    setAnswers(newAnswers)
    if (correct) {
      setCorrectCount((c) => c + 1)
      setPosition((p) => Math.min(MISSION_STEPS, p + 1))
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

    // Next question after 1.8s (or + penalty seconds for freeze)
    const wait = wrongType === 'BERHENTI_DETIK' && !correct ? 1800 + penaltyVal * 1000 : 1800
    setTimeout(() => {
      setSelected(null)
      setFeedback(null)
      setPenalty(0)
      if (current + 1 < game.questions.length) {
        setCurrent((c) => c + 1)
      } else {
        setPhase('done')
      }
    }, wait)
  }

  const progress = Math.round((current / game.questions.length) * 100)

  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🕵️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{game.title}</h1>
          {game.description && (
            <p className="text-gray-600 mb-6">{game.description}</p>
          )}

          <div className="text-left bg-gray-50 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm">📜 Peraturan Game</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>🎯 Jawab {game.questions.length} soal pilihan ganda</li>
              <li>
                🚶 Jawaban benar = maju 1 langkah di peta
              </li>
              {wrongType === 'MUNDUR_LANGKAH' && (
                <li>🚗 Jawaban salah = <b>tilang, mundur {penaltyVal} langkah</b></li>
              )}
              {wrongType === 'BERHENTI_DETIK' && (
                <li>⏸️ Jawaban salah = <b>tilang, berhenti {penaltyVal} detik</b></li>
              )}
              {wrongType === 'KEHILANGAN_POIN' && (
                <li>💔 Jawaban salah = <b>kehilangan {penaltyVal} poin</b></li>
              )}
              {wrongType === 'BEBAS' && (
                <li>🙂 Jawaban salah tidak dihukum</li>
              )}
              {timePerQuestion > 0 && (
                <li>⏱️ Waktu per soal: <b>{timePerQuestion} detik</b> — habis = dianggap salah</li>
              )}
            </ul>
            {game.rules?.customRules && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 whitespace-pre-line">
                ✍️ {game.rules.customRules}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setPhase('playing')
              setTimeLeft(timePerQuestion)
            }}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
          >
            🚀 Mulai Bermain
          </button>
        </div>
      </div>
    )
  }

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
              <div className="text-3xl font-bold text-amber-700">{position}/{MISSION_STEPS}</div>
              <div className="text-sm text-gray-500 mt-1">Langkah Maju</div>
            </div>
          </div>

          {wrongQuestions.length > 0 && (
            <div className="text-left bg-red-50 rounded-xl p-4 mb-6">
              <div className="font-medium text-red-800 text-sm mb-2">
                📋 Soal yang perlu dipelajari lagi:
              </div>
              <div className="flex flex-wrap gap-2">
                {wrongQuestions.map((n) => (
                  <span key={n} className="bg-white text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-full">
                    Soal {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setPhase('intro')
              setCurrent(0)
              setCorrectCount(0)
              setStreak(0)
              setBestStreak(0)
              setPosition(0)
              setAnswers([])
              setWrongQuestions([])
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            🔄 Main Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Soal {current + 1} / {game.questions.length}</span>
          <span className="font-medium text-blue-600">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Position on map */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="flex items-center gap-1 text-gray-600">
            🚩 <b>{position}</b>/15 langkah
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            🔥 Streak: <b className={streak >= 3 ? 'text-orange-500' : ''}>{streak}×</b>
          </span>
          {timePerQuestion > 0 && !feedback && (
            <span className={`font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
              ⏱ {timeLeft}s
            </span>
          )}
          {penalty > 0 && !feedback && (
            <span className="font-bold text-red-500 animate-pulse">⏸️ {penalty}s</span>
          )}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="text-xs text-gray-400 mb-2">Soal {question.order}</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-5 leading-relaxed">
          {question.text}
        </h2>

        <div className="space-y-3">
          {Object.entries(question.options).map(([key, val]) => {
            let style = 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
            if (selected) {
              if (key === question.correctAnswer) {
                style = 'border-green-500 bg-green-50'
              } else if (key === selected) {
                style = 'border-red-500 bg-red-50'
              } else {
                style = 'border-gray-200 opacity-60'
              }
            }
            return (
              <button
                key={key}
                disabled={!!selected}
                onClick={() => handleAnswer(key)}
                className={`w-full text-left border-2 rounded-xl px-4 py-3 transition disabled:cursor-default ${style}`}
              >
                <span className="font-bold text-gray-700 mr-2">{key}.</span>
                <span className="text-gray-800">{val}</span>
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mt-4 rounded-xl p-4 text-sm font-medium animate-pulse ${
              feedback.correct ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.msg}
            {!feedback.correct && question.explanation && (
              <div className="mt-2 text-xs font-normal text-gray-600">
                💡 {question.explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
