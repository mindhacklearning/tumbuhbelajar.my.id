import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { callAI, TASK_MODELS, estimateCost } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Silakan login dulu' }, { status: 401 })
    }

    const body = await request.json()
    const { kelas, category, subTopics } = body

    if (!category) {
      return NextResponse.json({ error: 'Pilih bab terlebih dahulu' }, { status: 400 })
    }

    const subBabText = Array.isArray(subTopics) && subTopics.length > 0
      ? subTopics.join(', ')
      : 'semua sub-bab'

    const prompt = `Kamu adalah guru Matematika SMP yang kreatif membuat game edukasi "Detektif Data".

Buatkan IDE JUDUL GAME dan DESKRIPSI MISI untuk game matematika dengan:
- Kelas: ${kelas || 8}
- Bab: ${category}
- Sub-bab: ${subBabText}

Buat 3 opsi judul yang menarik, seru, dan relevan dengan tema detektif (seperti "Detektif Pythagoras", "Misteri SPLDV", "Kasus Lingkaran Tersembunyi").
Untuk setiap opsi, sertakan deskripsi singkat (1-2 kalimat) yang menggambarkan cerita misi detektifnya.

Format JSON:
{
  "options": [
    { "title": "judul 1", "description": "deskripsi singkat 1" },
    { "title": "judul 2", "description": "deskripsi singkat 2" },
    { "title": "judul 3", "description": "deskripsi singkat 3" }
  ]
}

Hanya output JSON, tanpa teks lain.`

    const response = await callAI({
      model: TASK_MODELS.GENERATE_GAME_META,
      messages: [
        { role: 'system', content: 'Kamu adalah asisten guru matematika SMP yang kreatif. Selalu merespons dalam Bahasa Indonesia. Output hanya JSON valid.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 800,
    })

    const content = response.choices[0].message.content
    const modelUsed = response.model || TASK_MODELS.GENERATE_GAME_META
    const cost = estimateCost(
      modelUsed,
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    )

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to parse AI response')

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.options || !Array.isArray(parsed.options)) {
      throw new Error('Invalid AI response format')
    }

    return NextResponse.json({
      options: parsed.options.slice(0, 3),
      cost,
      modelUsed,
    })
  } catch (error) {
    console.error('Generate game meta error:', error)
    return NextResponse.json(
      { error: 'Gagal generate ide judul. Coba lagi.' },
      { status: 500 }
    )
  }
}
