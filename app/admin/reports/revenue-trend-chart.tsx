type Point = { label: Date; value: number }

export function RevenueTrendChart({ data }: { data: Point[] }) {
  const width = 480
  const height = 160
  const padding = 24
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - padding * 2)
    const y = height - padding - (d.value / maxValue) * (height - padding * 2)
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const last = points[points.length - 1]

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 w-full"
        role="img"
        aria-label="Revenue trend over the last 8 weeks"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="var(--border)"
          strokeWidth={1}
        />
        <path
          d={pathD}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {last && (
          <>
            <circle
              cx={last.x}
              cy={last.y}
              r={4}
              fill="var(--brand)"
              stroke="var(--background)"
              strokeWidth={2}
            />
            <text
              x={last.x}
              y={last.y - 10}
              textAnchor="end"
              className="fill-foreground text-[10px] font-semibold"
            >
              ${last.value.toFixed(0)}
            </text>
          </>
        )}
        {points.map((p) => (
          <circle key={p.label.toISOString()} cx={p.x} cy={p.y} r={8} fill="transparent">
            <title>{`Week of ${p.label.toLocaleDateString()}: $${p.value.toFixed(2)}`}</title>
          </circle>
        ))}
      </svg>

      <table className="mt-3 w-full text-left text-xs text-muted-foreground">
        <caption className="sr-only">Weekly revenue table</caption>
        <thead>
          <tr>
            <th className="pr-2">Week of</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label.toISOString()}>
              <td className="pr-2">{d.label.toLocaleDateString()}</td>
              <td>${d.value.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
