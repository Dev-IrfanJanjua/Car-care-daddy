import type { VehicleClass } from '@/lib/vehicles/classes'

/**
 * Four flat side-view car illustrations, one per car type. Drawn as inline SVG
 * so they stay crisp at any size, cost no image requests and work in both
 * themes. Each silhouette differs where it matters for telling the types apart:
 * the hatchback's short chopped tail, the sedan's separate boot, the
 * crossover's raised stance with body cladding, the SUV's tall boxy cabin.
 */
const PALETTE: Record<string, { body: string; shade: string }> = {
  hatchback: { body: '#f3b23c', shade: '#d9921f' },
  sedan: { body: '#e5533d', shade: '#bf3a27' },
  crossover: { body: '#2f6fe4', shade: '#2152b3' },
  suv: { body: '#3b4a6b', shade: '#28344f' },
}

const GLASS = '#cfe3f2'

function Wheel({ cx, cy = 92, r = 17 }: { cx: number; cy?: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1f2328" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="#d5d9de" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#7b828b" />
      {[0, 72, 144, 216, 288].map((a) => (
        <line
          key={a}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos((a * Math.PI) / 180) * r * 0.56}
          y2={cy + Math.sin((a * Math.PI) / 180) * r * 0.56}
          stroke="#7b828b"
          strokeWidth="1.6"
        />
      ))}
    </g>
  )
}

export function CarTypeArt({ type, className }: { type: VehicleClass | string; className?: string }) {
  const c = PALETTE[type] ?? PALETTE.sedan

  return (
    <svg viewBox="6 10 232 102" role="img" aria-label={`${type} illustration`} className={className}>
      <ellipse cx="120" cy="109" rx="96" ry="6" fill="#000" opacity="0.14" />

      {type === 'hatchback' && (
        <g>
          <path
            d="M22 92 L22 70 Q22 62 32 58 L58 54 Q66 40 78 37 L134 37 Q142 37 148 44 L168 63 L206 69 Q222 73 224 86 L224 92 Z"
            fill={c.body}
          />
          <path d="M22 80 L224 80 L224 92 L22 92 Z" fill={c.shade} opacity="0.35" />
          <path d="M70 45 Q74 41 80 41 L108 41 L108 62 L60 62 Z" fill={GLASS} />
          <path d="M113 41 L134 41 Q139 41 143 46 L158 62 L113 62 Z" fill={GLASS} />
          <rect x="111" y="43" width="2" height="19" fill={c.shade} />
          <rect x="208" y="74" width="14" height="6" rx="3" fill="#fff6cf" />
          <rect x="22" y="72" width="6" height="8" rx="2" fill="#e34a3b" />
        </g>
      )}

      {type === 'sedan' && (
        <g>
          <path
            d="M12 92 L12 72 Q12 64 22 62 L62 58 L88 40 Q92 37 98 37 L136 37 Q144 37 150 43 L172 62 L208 68 Q224 72 226 86 L226 92 Z"
            fill={c.body}
          />
          <path d="M12 80 L226 80 L226 92 L12 92 Z" fill={c.shade} opacity="0.35" />
          <path d="M92 45 Q95 42 100 42 L121 42 L121 61 L74 61 Z" fill={GLASS} />
          <path d="M126 42 L136 42 Q141 42 145 47 L160 61 L126 61 Z" fill={GLASS} />
          <rect x="209" y="73" width="14" height="6" rx="3" fill="#fff6cf" />
          <rect x="12" y="73" width="7" height="8" rx="2" fill="#a92a1c" />
        </g>
      )}

      {type === 'crossover' && (
        <g>
          <path
            d="M16 88 L16 62 Q16 54 26 51 L60 47 Q68 32 80 29 L136 29 Q144 29 150 36 L170 56 L206 61 Q222 65 224 80 L224 88 Z"
            fill={c.body}
          />
          <path d="M16 76 L224 76 L224 88 L16 88 Z" fill="#23272d" opacity="0.85" />
          <path d="M72 38 Q76 34 82 34 L108 34 L108 54 L62 54 Z" fill={GLASS} />
          <path d="M113 34 L134 34 Q139 34 143 39 L158 54 L113 54 Z" fill={GLASS} />
          <rect x="111" y="36" width="2" height="18" fill={c.shade} />
          <rect x="208" y="65" width="14" height="6" rx="3" fill="#fff6cf" />
          <rect x="16" y="64" width="6" height="8" rx="2" fill="#e34a3b" />
        </g>
      )}

      {type === 'suv' && (
        <g>
          <path
            d="M14 90 L14 54 Q14 47 22 45 L44 43 L54 24 Q56 21 62 21 L148 21 Q155 21 159 26 L180 49 L210 55 Q226 59 228 76 L228 90 Z"
            fill={c.body}
          />
          <path d="M14 76 L228 76 L228 90 L14 90 Z" fill="#23272d" opacity="0.85" />
          <path d="M60 28 L82 28 L82 50 L50 50 Z" fill={GLASS} />
          <path d="M87 28 L118 28 L118 50 L87 50 Z" fill={GLASS} />
          <path d="M123 28 L148 28 Q152 28 155 32 L170 50 L123 50 Z" fill={GLASS} />
          <line x1="56" y1="18" x2="150" y2="18" stroke="#1f2328" strokeWidth="3" strokeLinecap="round" />
          <rect x="210" y="61" width="14" height="6" rx="3" fill="#fff6cf" />
          <rect x="14" y="58" width="6" height="9" rx="2" fill="#e34a3b" />
        </g>
      )}

      {/* wheel arches, then wheels */}
      {(() => {
        const r = type === 'suv' ? 21 : type === 'crossover' ? 20 : 17.5
        const cy = type === 'suv' ? 90 : type === 'crossover' ? 88 : 92
        const xs = type === 'sedan' ? [58, 182] : type === 'hatchback' ? [56, 180] : [58, 184]
        return xs.map((x) => (
          <g key={x}>
            <circle cx={x} cy={cy} r={r + 4} fill="#16191d" opacity="0.9" />
            <Wheel cx={x} cy={cy} r={r} />
          </g>
        ))
      })()}
    </svg>
  )
}
