import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Live monitoring data: student attempts, streaks, wrong questions
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    })
    if (!teacher) return NextResponse.json({ error: 'Not a teacher' }, { status: 403 })

    const game = await prisma.game.findUnique({ where: { id } })
    if (!game || game.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Attempts with answers + student info
    const attempts = await prisma.attempt.findMany({
      where: { gameId: id },
      include: {
        student: true,
        answers: { include: { question: { select: { order: true, text: true } } } },
      },
      orderBy: { startedAt: 'desc' },
      take: 200,
    })

    // Question stats: count wrong per question
    const questions = await prisma.question.findMany({
      where: { mission: { gameId: id } },
      select: { id: true, order: true, text: true },
    })

    const wrongByQuestion = questions.map((q) => {
      const wrongCount = attempts.reduce(
        (sum, a) =>
          sum +
          a.answers.filter(
            (ans) => ans.questionId === q.id && ans.isCorrect === false
          ).length,
        0
      )
      const totalCount = attempts.reduce(
        (sum, a) => sum + a.answers.filter((ans) => ans.questionId === q.id).length,
        0
      )
      return {
        order: q.order,
        text: q.text.length > 60 ? q.text.slice(0, 60) + '…' : q.text,
        wrongCount,
        totalCount,
        wrongRate: totalCount > 0 ? Math.round((wrongCount / totalCount) * 100) : 0,
      }
    })

    // Student summary: streaks computed from answer sequence
    const students = attempts.map((attempt) => {
      const ordered = [...attempt.answers].sort(
        (a, b) => new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime()
      )
      let bestStreak = 0
      let currentStreak = 0
      let correctCount = 0
      let wrongCount = 0
      for (const ans of ordered) {
        if (ans.isCorrect === true) {
          currentStreak++
          bestStreak = Math.max(bestStreak, currentStreak)
          correctCount++
        } else if (ans.isCorrect === false) {
          currentStreak = 0
          wrongCount++
        }
      }
      const total = ordered.length
      return {
        id: attempt.id,
        studentName: attempt.student.name || 'Siswa',
        status: attempt.status,
        score: attempt.score,
        correctCount,
        wrongCount,
        total,
        bestStreak,
        progress: total > 0 ? Math.round((correctCount / total) * 100) : 0,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
      }
    })

    // Sort: completed first by score desc, then in-progress by progress desc
    students.sort((a, b) => {
      if (a.completedAt && b.completedAt) return (b.score || 0) - (a.score || 0)
      if (a.completedAt) return -1
      if (b.completedAt) return 1
      return b.progress - a.progress
    })

    return NextResponse.json({
      game: { id: game.id, title: game.title },
      totalAttempts: attempts.length,
      activeNow: attempts.filter((a) => !a.completedAt).length,
      completed: attempts.filter((a) => a.completedAt).length,
      students,
      wrongByQuestion,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Live data error:', error)
    return NextResponse.json({ error: 'Failed to load live data' }, { status: 500 })
  }
}
