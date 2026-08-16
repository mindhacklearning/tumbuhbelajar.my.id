// AI Service using Sumopod API
// Primary model: gpt-4o-mini (cheap & reliable)
// Fallback: gemini-3.5-flash-lite (very cheap), MiniMax-M2.7-highspeed

const SUMOPOD_BASE_URL = process.env.SUMOPOD_BASE_URL || 'https://ai.sumopod.com/v1'
const SUMOPOD_API_KEY = process.env.SUMOPOD_API_KEY || ''

interface AIRequest {
  model: string
  messages: { role: string; content: string }[]
  temperature?: number
  max_tokens?: number
}

interface AIResponse {
  id: string
  model: string
  choices: {
    message: { content: string }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export const AI_MODELS = {
  GPT_4O_MINI: 'gpt-4o-mini',
  GEMINI_FLASH_LITE: 'gemini/gemini-3.5-flash-lite',
  MINI_MAX: 'MiniMax-M2.7-highspeed',
  KIMI_K2_7: 'kimi-k2.7',
  KIMI_K3: 'kimi-k3',
} as const

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS]

// Cost estimation in USD per 1M tokens
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  [AI_MODELS.GPT_4O_MINI]: { input: 0.15, output: 0.6 }, // cheap, reliable
  [AI_MODELS.GEMINI_FLASH_LITE]: { input: 0.075, output: 0.3 }, // very cheap
  [AI_MODELS.MINI_MAX]: { input: 0.03, output: 0.12 }, // 90% discount!
  [AI_MODELS.KIMI_K2_7]: { input: 0.95, output: 4.0 },
  [AI_MODELS.KIMI_K3]: { input: 3.0, output: 15.0 },
}

// Estimate cost in Rupiah (IDR)
const USD_TO_IDR = 16500

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = MODEL_COSTS[model] || { input: 0, output: 0 }
  const inputCost = (inputTokens / 1_000_000) * costs.input * USD_TO_IDR
  const outputCost = (outputTokens / 1_000_000) * costs.output * USD_TO_IDR
  return Math.round(inputCost + outputCost)
}

export async function callAI(request: AIRequest): Promise<AIResponse> {
  const response = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUMOPOD_API_KEY}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI API error: ${response.status} - ${error}`)
  }

  return response.json()
}

// ============================================
// PROMPTS FOR SPECIFIC TASKS
// ============================================

const SYSTEM_PROMPTS = {
  generateQuestions: `Kamu adalah guru Matematika SMP berpengalaman. Buat soal TKA (Tes Kompetensi Akademik) untuk siswa SMP.
Jika diminta, buatkan juga 3 tujuan pembelajaran (learningObjectives) dengan kata kerja operasional yang spesifik.
Format JSON:
{
  "learningObjectives": ["Tujuan 1", "Tujuan 2", "Tujuan 3"],
  "questions": [
    {
      "order": 1,
      "type": "PG",
      "text": "Soal dalam markdown",
      "options": {"A": "Pilihan A", "B": "Pilihan B", "C": "Pilihan C", "D": "Pilihan D"},
      "correctAnswer": "A",
      "explanation": "Penjelasan jawaban",
      "difficulty": "MEDIUM",
      "topic": "Sub-topik spesifik"
    }
  ]
}
CATATAN PENTING:
- Field "type" WAJIB ada di setiap soal dan harus sesuai format tipe yang diminta
- Untuk PG: gunakan "correctAnswer"
- Untuk PG_KOMPLEKS: gunakan "correctAnswers" (array, minimal 2 benar)
- Untuk NUMERIK: gunakan "correctAnswer" berupa angka (string)
- Untuk ISIAN: gunakan "correctAnswer" berupa kata/frasa
- Untuk MENJODOHKAN: gunakan "pairs" dan "correctAnswer" (kode urutan)
- Untuk URUTAN: gunakan "steps" dan "correctAnswer" (urutan angka dipisah koma)
- Jangan pernah menaruh penjelasan di dalam soal
- Options selalu 4 (A-D) kecuali BENAR_SALAH (A=Benar, B=Salah)`,

  generateRPP: `Kamu adalah ahli penyusunan RPP (Rencana Pelaksanaan Pembelajaran) Kurikulum Merdeka.
Buat RPP lengkap dengan komponen:
- Tujuan pembelajaran
- Asesmen awal
- Kegiatan pembelajaran (apersepsi, inti, penutup)
- Asesmen formatif & sumatif
- Remedial & pengayaan
- Modifikasi untuk diferensiasi

Format markdown yang rapi.`,
  
  generateLKPD: `Kamu adalah ahli penyusunan LKPD (Lembar Kerja Peserta Didik) Kurikulum Merdeka.
Buat LKPD yang:
- Mengarah ke tujuan pembelajaran
- Menuntut partisipasi aktif siswa
- Menggunakan pendekatan saintifik
- Bisa dikerjakan secara individu/kelompok

Format markdown dengan tabel dan langkah-langkah yang jelas.`,
  
  generateRubrik: `Kamu adalah ahli penyusunan rubrik penilaian Kurikulum Merdeka.
Buat rubrik penilaian untuk essay/uraian dengan:
- Deskripsi kriteria untuk setiap level (1-4)
- Indikator pencapaian kompetensi
- Bobot untuk setiap aspek

Format markdown dengan tabel rubrik.`,
  
  analyzeClass: `Kamu adalah analisis data pendidikan. Analisis hasil belajar kelas dan berikan:
1. Statistik deskriptif (rata-rata, SD, distribusi)
2. Konsep yang dikuasai kelas
3. Konsep yang masih perlu penguatan
4. Rekomendasi strategi pembelajaran
5. Siswa yang perlu perhatian khusus

Format JSON dengan struktur yang rapi.`,
  
  interventionRecommendation: `Kamu adalah konselor pendidikan. Berdasarkan data siswa:
1. Identifikasi masalah utama
2. Rekomendasi intervensi spesifik
3. Saran untuk guru
4. Saran untuk orang tua
5. Target pencapaian

Format JSON yang actionable.`,
}

export interface GeneratedQuestions {
  questions: {
    order: number
    type?: string
    text: string
    options?: Record<string, string>
    correctAnswer?: string
    correctAnswers?: string[]
    pairs?: { left: string; right: string }[]
    steps?: string[]
    explanation: string
    difficulty: string
    topic: string
  }[]
}

// Generate TKA Questions
export type QuestionType = 'PG' | 'BENAR_SALAH' | 'PG_KOMPLEKS' | 'NUMERIK' | 'ISIAN' | 'MENJODOHKAN' | 'URUTAN'

export const QUESTION_TYPES: Record<QuestionType, { label: string; desc: string }> = {
  PG: { label: 'Pilihan Ganda', desc: 'Pilih 1 jawaban benar dari 4 opsi' },
  BENAR_SALAH: { label: 'Benar / Salah', desc: 'Tentukan pernyataan benar atau salah' },
  PG_KOMPLEKS: { label: 'PG Kompleks', desc: 'Pilih semua jawaban yang benar (bisa >1)' },
  NUMERIK: { label: 'Jawaban Angka', desc: 'Ketik angka jawaban langsung' },
  ISIAN: { label: 'Isian Singkat', desc: 'Ketik kata/frasa pendek' },
  MENJODOHKAN: { label: 'Menjodohkan', desc: 'Pasangkan kiri-kanan' },
  URUTAN: { label: 'Mengurutkan', desc: 'Susun urutan yang benar' },
}

const TYPE_INSTRUCTIONS: Record<QuestionType, string> = {
  PG: `{"type":"PG","text":"soal","options":{"A":"..","B":"..","C":"..","D":".."},"correctAnswer":"A","explanation":".."}`,
  BENAR_SALAH: `{"type":"BENAR_SALAH","text":"pernyataan","options":{"A":"Benar","B":"Salah"},"correctAnswer":"A","explanation":".."}`,
  PG_KOMPLEKS: `{"type":"PG_KOMPLEKS","text":"soal","options":{"A":"..","B":"..","C":"..","D":".."},"correctAnswers":["A","C"],"explanation":".."}`,
  NUMERIK: `{"type":"NUMERIK","text":"soal","correctAnswer":"12","explanation":".."}`,
  ISIAN: `{"type":"ISIAN","text":"soal dengan ....","correctAnswer":"jawaban","explanation":".."}`,
  MENJODOHKAN: `{"type":"MENJODOHKAN","text":"instruksi","pairs":[{"left":"A","right":"1"},{"left":"B","right":"2"},{"left":"C","right":"3"},{"left":"D","right":"4"}],"correctAnswer":"A1B2C3D4","explanation":".."}`,
  URUTAN: `{"type":"URUTAN","text":"instruksi","steps":["langkah1","langkah2","langkah3","langkah4"],"correctAnswer":"1,2,3,4","explanation":".."}`,
}

export async function generateQuestions(
  topic: string,
  subTopics: string[],
  difficulty: string = 'MEDIUM',
  count: number = 15,
  learningObjectives?: string[],
  questionTypes: QuestionType[] = ['PG']
): Promise<{
  questions: GeneratedQuestions['questions']
  learningObjectives: string[]
  cost: number
  modelUsed: string
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
}> {
  const objectivesSection = learningObjectives && learningObjectives.length > 0
    ? `\nTujuan pembelajaran yang harus dicapai:\n${learningObjectives.map((o) => `- ${o}`).join('\n')}\n\nBuat soal yang sesuai dengan tujuan pembelajaran tersebut.`
    : `\nBuatkan juga 3 tujuan pembelajaran (learning objectives) yang sesuai dengan topik ini. Tujuan harus menggunakan kata kerja operasional (misal: menganalisis, menerapkan, menghitung, menyelesaikan masalah) dan spesifik.`

  const typesText = questionTypes.length > 0
    ? `Gunakan model soal berikut (sebarkan secara merata): ${questionTypes.join(', ')}`
    : 'Gunakan model soal Pilihan Ganda (PG).'

  const typeFormats = questionTypes
    .map((t) => `- ${QUESTION_TYPES[t].label} (${t}): ${TYPE_INSTRUCTIONS[t]}`)
    .join('\n')

  const prompt = `Buat ${count} soal TKA Matematika SMP tentang "${topic}".
Sub-topik: ${subTopics.join(', ')}
Tingkat kesulitan: ${difficulty}
${objectivesSection}

Model soal:
${typesText}

Format JSON untuk setiap tipe:
${typeFormats}

Pastikan:
- 40% soal mudah, 40% sedang, 20% sulit
- Setiap soal memiliki field "type" sesuai modelnya
- Hanya satu jawaban benar (kecuali PG_KOMPLEKS dengan correctAnswers array)
- Include explanation untuk setiap jawaban

${SYSTEM_PROMPTS.generateQuestions}`

  const response = await callAI({
    model: AI_MODELS.GPT_4O_MINI,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.generateQuestions },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  })

  const content = response.choices[0].message.content
  const modelUsed = response.model || AI_MODELS.GPT_4O_MINI
  const cost = estimateCost(
    modelUsed,
    response.usage?.prompt_tokens || 0,
    response.usage?.completion_tokens || 0
  )

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response')

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedQuestions & {
    learningObjectives?: string[]
  }
  const generatedObjectives =
    parsed.learningObjectives && parsed.learningObjectives.length > 0
      ? parsed.learningObjectives
      : learningObjectives && learningObjectives.length > 0
        ? learningObjectives
        : []

  return {
    questions: parsed.questions,
    learningObjectives: generatedObjectives,
    cost,
    modelUsed,
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
  }
}

// Generate RPP
export async function generateRPP(params: {
  subject: string
  topic: string
  grade: number
  duration: number // in minutes
}): Promise<{ content: string; cost: number }> {
  const prompt = `Buat RPP untuk:
- Mata pelajaran: ${params.subject}
- Topik: ${params.topic}
- Kelas: ${params.grade}
- Alokasi waktu: ${params.duration} menit

${SYSTEM_PROMPTS.generateRPP}`

  const response = await callAI({
    model: AI_MODELS.GPT_4O_MINI,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.generateRPP },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
  })

  const content = response.choices[0].message.content
  const cost = estimateCost(
    AI_MODELS.GPT_4O_MINI,
    response.usage?.prompt_tokens || 0,
    response.usage?.completion_tokens || 0
  )

  return { content, cost }
}

// Generate LKPD
export async function generateLKPD(params: {
  subject: string
  topic: string
  grade: number
}): Promise<{ content: string; cost: number }> {
  const prompt = `Buat LKPD untuk:
- Mata pelajaran: ${params.subject}
- Topik: ${params.topic}
- Kelas: ${params.grade}

${SYSTEM_PROMPTS.generateLKPD}`

  const response = await callAI({
    model: AI_MODELS.GPT_4O_MINI,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.generateLKPD },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 6000,
  })

  const content = response.choices[0].message.content
  const cost = estimateCost(
    AI_MODELS.GPT_4O_MINI,
    response.usage?.prompt_tokens || 0,
    response.usage?.completion_tokens || 0
  )

  return { content, cost }
}

// Analyze class performance
export async function analyzeClassPerformance(params: {
  className: string
  topic: string
  students: {
    name: string
    preTestScore: number
    postTestScore: number
    timeSpent: number
  }[]
}): Promise<{ analysis: string; nGain: number; recommendations: string }> {
  const prompt = `Analisis performa kelas "${params.className}" untuk topik "${params.topic}":

Data siswa:
${params.students.map(s => `- ${s.name}: Pre-test=${s.preTestScore}, Post-test=${s.postTestScore}, Waktu=${s.timeSpent} menit`).join('\n')}

Hitung N-Gain dan berikan analisis komprehensif.

${SYSTEM_PROMPTS.analyzeClass}

Format respons JSON:
{
  "analysis": "analisis dalam markdown",
  "nGain": 0.65,
  "recommendations": "rekomendasi dalam markdown"
}`

  const response = await callAI({
    model: AI_MODELS.GPT_4O_MINI,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.analyzeClass },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 4000,
  })

  const content = response.choices[0].message.content
  const cost = estimateCost(
    AI_MODELS.GPT_4O_MINI,
    response.usage?.prompt_tokens || 0,
    response.usage?.completion_tokens || 0
  )

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response')
  
  const parsed = JSON.parse(jsonMatch[0])
  return { ...parsed, cost }
}

// Intervention recommendations
export async function getInterventionRecommendation(params: {
  studentName: string
  diagnoses: { type: string; score: number; date: string }[]
  attempts: { game: string; score: number; date: string }[]
  nonCognitive: { dimension: string; score: number }[]
}): Promise<{ interventions: string[]; priority: string; timeline: string }> {
  const prompt = `Rekomendasi intervensi untuk siswa "${params.studentName}":

Riwayat diagnosa:
${params.diagnoses.map(d => `- ${d.type} (${d.date}): ${d.score}/100`).join('\n')}

Riwayat attempt:
${params.attempts.map(a => `- ${a.game} (${a.date}): ${a.score}/100`).join('\n')}

Aspek non-kognitif:
${params.nonCognitive.map(n => `- ${n.dimension}: ${n.score}/4`).join('\n')}

${SYSTEM_PROMPTS.interventionRecommendation}

Format JSON:
{
  "interventions": ["list of specific interventions"],
  "priority": "HIGH/MEDIUM/LOW",
  "timeline": "timeline recommendations"
}`

  const response = await callAI({
    model: AI_MODELS.KIMI_K2_7, // Use stronger model for deep analysis
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.interventionRecommendation },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 3000,
  })

  const content = response.choices[0].message.content
  const cost = estimateCost(
    AI_MODELS.KIMI_K2_7,
    response.usage?.prompt_tokens || 0,
    response.usage?.completion_tokens || 0
  )

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response')
  
  const parsed = JSON.parse(jsonMatch[0])
  return { ...parsed, cost }
}

// Grade essay
export async function gradeEssay(params: {
  question: string
  rubric: string
  studentAnswer: string
}): Promise<{ score: number; feedback: string; strengths: string[]; weaknesses: string[] }> {
  const prompt = `Grade jawaban essay siswa untuk pertanyaan:
"${params.question}"

Rubrik:
${params.rubric}

Jawaban siswa:
${params.studentAnswer}

Berikan grading dan feedback komprehensif.

Format JSON:
{
  "score": 85,
  "feedback": "feedback umum dalam markdown",
  "strengths": ["kekuatan siswa"],
  "weaknesses": ["area improvement"]
}`

  const response = await callAI({
    model: AI_MODELS.GPT_4O_MINI,
    messages: [
      { role: 'system', content: 'Kamu adalah guru yang memberikan grading yang adil dan konstruktif.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  })

  const content = response.choices[0].message.content
  const cost = estimateCost(
    AI_MODELS.GPT_4O_MINI,
    response.usage?.prompt_tokens || 0,
    response.usage?.completion_tokens || 0
  )

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response')
  
  const parsed = JSON.parse(jsonMatch[0])
  return { ...parsed, cost }
}
