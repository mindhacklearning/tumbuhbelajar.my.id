"use client"

// Game map: detective journey with mission nodes
// 6 missions laid out on a winding path

const MISSION_NAMES = [
  'Teka-Teki Pertama',
  'Jejak Tersembunyi',
  'Kode Rahasia',
  'Ruang Terlarang',
  'Petunjuk Terakhir',
  'Kasus Terungkap',
]

const MISSION_ICONS = ['🔍', '🕵️', '🗝️', '🚪', '📜', '🏆']

// Path coordinates (winding road)
const PATH = [
  'M 40 300',
  'C 100 300, 80 200, 160 200',
  'C 240 200, 220 300, 300 300',
  'C 380 300, 360 200, 440 200',
  'C 520 200, 500 300, 580 300',
  'C 660 300, 640 200, 720 200',
].join(' ')

// Node positions along the path
const NODES = [
  { x: 40, y: 300 },
  { x: 160, y: 200 },
  { x: 300, y: 300 },
  { x: 440, y: 200 },
  { x: 580, y: 300 },
  { x: 720, y: 200 },
]

export default function GameMap({
  missionCounts,
  totalQuestions,
}: {
  missionCounts: number[]
  totalQuestions: number
}) {
  const activeCount = missionCounts.filter((c) => c > 0).length

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">🗺️ Peta Misi Detektif</h3>
          <p className="text-sm text-gray-500">
            {activeCount > 0
              ? `${activeCount} misi terbuka · ${totalQuestions} soal siap dimainkan`
              : 'Generate soal AI untuk membuka misi pertama'}
          </p>
        </div>
        {activeCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Siap Dimainkan
          </span>
        )}
      </div>

      <svg viewBox="0 0 760 400" className="w-full" role="img" aria-label="Peta misi game detektif">
        {/* Background */}
        <rect x="0" y="0" width="760" height="400" rx="16" fill="#f8fafc" />

        {/* Decorative trees/clouds */}
        <g fill="#dcfce7">
          <circle cx="100" cy="80" r="22" />
          <circle cx="118" cy="95" r="18" />
          <circle cx="82" cy="95" r="18" />
          <circle cx="560" cy="90" r="20" />
          <circle cx="576" cy="104" r="16" />
          <circle cx="544" cy="104" r="16" />
        </g>
        <g fill="#e0f2fe">
          <circle cx="340" cy="60" r="18" />
          <circle cx="356" cy="72" r="14" />
          <circle cx="324" cy="72" r="14" />
          <circle cx="680" cy="330" r="16" />
          <circle cx="694" cy="342" r="13" />
          <circle cx="666" cy="342" r="13" />
        </g>

        {/* Road shadow */}
        <path d={PATH} fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        {/* Road */}
        <path d={PATH} fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" strokeDasharray="14 8" opacity="0.85" />

        {/* Nodes */}
        {NODES.map((node, i) => {
          const count = missionCounts[i] || 0
          const unlocked = count > 0
          const isNext = i === activeCount && activeCount < NODES.length
          return (
            <g key={i}>
              {/* Glow for active/next */}
              {(unlocked || isNext) && (
                <circle cx={node.x} cy={node.y} r="34" fill="#dbeafe" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={unlocked ? 28 : 24}
                fill={unlocked ? '#2563eb' : '#94a3b8'}
                stroke="white"
                strokeWidth="4"
              />
              {/* Icon */}
              <text
                x={node.x}
                y={node.y + 6}
                textAnchor="middle"
                fontSize="20"
              >
                {unlocked ? MISSION_ICONS[i] : '🔒'}
              </text>
              {/* Label */}
              <text
                x={node.x}
                y={node.y + 52}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={unlocked ? '#1e293b' : '#94a3b8'}
              >
                Misi {i + 1}
              </text>
              <text
                x={node.x}
                y={node.y + 68}
                textAnchor="middle"
                fontSize="10"
                fill={unlocked ? '#64748b' : '#cbd5e1'}
              >
                {unlocked ? `${count} soal` : 'Terkunci'}
              </text>
            </g>
          )
        })}

        {/* Start flag */}
        <text x="20" y="360" fontSize="14">🚩</text>
        <text x="60" y="360" fontSize="11" fill="#64748b">MULAI</text>

        {/* Finish */}
        <text x="700" y="150" fontSize="16">🏆</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Terbuka
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span> Terkunci
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-2 rounded bg-amber-500 inline-block"></span> Jalan Detektif
        </span>
      </div>
    </div>
  )
}
