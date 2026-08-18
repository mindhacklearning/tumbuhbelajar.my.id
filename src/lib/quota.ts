import { prisma } from '@/lib/prisma'
import { PLANS, FREE_PLAN, type PlanConfig } from '@/lib/plans'

// Get current month key "2026-08"
export function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Resolve plan config from subscription key
export function getPlan(subscription: string): PlanConfig {
  return PLANS[subscription] || FREE_PLAN
}

// Check & reset quota counters if month changed
export async function ensureQuotaMonth(teacherId: string) {
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } })
  if (!teacher) return teacher

  const month = currentMonth()
  if (teacher.quotaMonth !== month) {
    return prisma.teacher.update({
      where: { id: teacherId },
      data: {
        quotaMonth: month,
        gameUsed: 0,
        analysisUsed: 0,
        rppUsed: 0,
      },
    })
  }
  return teacher
}

export type QuotaType = 'game' | 'analysis' | 'rpp'

// Check if user has quota left for a given action type
export async function checkQuota(teacherId: string, type: QuotaType) {
  const teacher = await ensureQuotaMonth(teacherId)
  if (!teacher) return { ok: false, error: 'Akun guru tidak ditemukan', remaining: 0 }

  const plan = getPlan(teacher.subscription)
  const used = type === 'game' ? teacher.gameUsed : type === 'analysis' ? teacher.analysisUsed : teacher.rppUsed
  const limit = type === 'game' ? plan.quota.gamePerMonth : type === 'analysis' ? plan.quota.analysisPerMonth : plan.quota.rppPerMonth

  if (used >= limit) {
    return {
      ok: false,
      error: `Kuota ${type} bulan ini habis (${limit}/${limit}). Upgrade paket atau tunggu bulan depan.`,
      remaining: 0,
    }
  }
  return { ok: true, remaining: limit - used, used, limit }
}

// Increment usage counter
export async function incrementQuota(teacherId: string, type: QuotaType) {
  const field = type === 'game' ? 'gameUsed' : type === 'analysis' ? 'analysisUsed' : 'rppUsed'
  return prisma.teacher.update({
    where: { id: teacherId },
    data: { [field]: { increment: 1 }, aiActionsUsed: { increment: 1 } },
  })
}

// Get quota summary for dashboard display
export async function getQuotaSummary(teacherId: string) {
  const teacher = await ensureQuotaMonth(teacherId)
  if (!teacher) return null
  const plan = getPlan(teacher.subscription)
  return {
    plan: teacher.subscription,
    planName: plan.name,
    marketing: plan.marketing,
    quota: {
      game: { used: teacher.gameUsed, limit: plan.quota.gamePerMonth },
      analysis: { used: teacher.analysisUsed, limit: plan.quota.analysisPerMonth },
      rpp: { used: teacher.rppUsed, limit: plan.quota.rppPerMonth },
    },
    subscriptionEnd: teacher.subscriptionEnd,
  }
}
