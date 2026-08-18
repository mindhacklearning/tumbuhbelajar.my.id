// Paket langganan & kuota (Opsi B: fair use + token)
// Model: deepseek-v4-flash (soal/analisis), gpt-4o-mini (RPP/LKPD)
export interface PlanConfig {
  name: string
  durationMonths: number
  price: number
  marketing: {
    tokenLabel: string // e.g. "setara biaya 20x Rp 400.000"
    gamePerMonth: number
    analysisPerMonth: number
    rppPerMonth: number
  }
  quota: {
    gamePerMonth: number
    analysisPerMonth: number
    rppPerMonth: number
  }
}

export const PLANS: Record<string, PlanConfig> = {
  STARTER_3: {
    name: 'Starter',
    durationMonths: 3,
    price: 120_000,
    marketing: {
      tokenLabel: 'setara biaya 20x Rp 400.000',
      gamePerMonth: 30,
      analysisPerMonth: 15,
      rppPerMonth: 5,
    },
    quota: {
      gamePerMonth: 30,
      analysisPerMonth: 15,
      rppPerMonth: 5,
    },
  },
  PRO_6: {
    name: 'Pro',
    durationMonths: 6,
    price: 210_000,
    marketing: {
      tokenLabel: 'setara biaya 20x Rp 1.000.000',
      gamePerMonth: 60,
      analysisPerMonth: 30,
      rppPerMonth: 10,
    },
    quota: {
      gamePerMonth: 60,
      analysisPerMonth: 30,
      rppPerMonth: 10,
    },
  },
  PREMIUM_12: {
    name: 'Premium',
    durationMonths: 12,
    price: 400_000,
    marketing: {
      tokenLabel: 'setara biaya 20x Rp 2.400.000',
      gamePerMonth: 120,
      analysisPerMonth: 60,
      rppPerMonth: 20,
    },
    quota: {
      gamePerMonth: 120,
      analysisPerMonth: 60,
      rppPerMonth: 20,
    },
  },
}

// FREE tier: limited for demo
export const FREE_PLAN: PlanConfig = {
  name: 'Free',
  durationMonths: 1,
  price: 0,
  marketing: {
    tokenLabel: 'demo terbatas',
    gamePerMonth: 3,
    analysisPerMonth: 2,
    rppPerMonth: 1,
  },
  quota: {
    gamePerMonth: 3,
    analysisPerMonth: 2,
    rppPerMonth: 1,
  },
}
