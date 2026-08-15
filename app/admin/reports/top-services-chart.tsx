type ServiceCount = { name: string; count: number }

// Bar rounded on the leading (value) edge only, square at the baseline.
function roundedBarPath(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, h / 2, w))
  return `M ${x} ${y} H ${x + w - radius} Q ${x + w} ${y} ${x + w} ${y + radius} V ${
    y + h - radius
  } Q ${x + w} ${y + h} ${x + w - radius} ${y + h} H ${x} Z`
}

export function TopServicesChart({ data }: { data: ServiceCount[] }) {
  if (data.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">No completed bookings yet.</p>
  }

  const width = 480
  const barHeight = 24
  const gap = 12
  const labelWidth = 140
  const height = data.length * (barHeight + gap) + gap
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const chartWidth = width - labelWidth - 40

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 w-full"
        role="img"
        aria-label="Top services by number of bookings"
      >
        {data.map((d, i) => {
          const y = gap + i * (barHeight + gap)
          const barW = Math.max((d.count / maxCount) * chartWidth, 4)
          return (
            <g key={d.name}>
              <text
                x={labelWidth - 8}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                className="fill-foreground text-[11px]"
              >
                {d.name}
              </text>
              <path d={roundedBarPath(labelWidth, y, barW, barHeight, 4)} fill="var(--brand)">
                <title>{`${d.name}: ${d.count} bookings`}</title>
              </path>
              <text
                x={labelWidth + barW + 6}
                y={y + barHeight / 2 + 4}
                className="fill-foreground text-[11px] font-semibold"
              >
                {d.count}
              </text>
            </g>
          )
        })}
      </svg>

      <table className="mt-3 w-full text-left text-xs text-muted-foreground">
        <caption className="sr-only">Top services table</caption>
        <thead>
          <tr>
            <th>Service</th>
            <th>Bookings</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <td>{d.name}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
