interface LineChartProps {
  data: {
    labels: string[]
    datasets: {
      name: string
      color: string
      values: number[]
    }[]
  }
  title: string
  subtitle?: string
}

export function LineChart({ data, title, subtitle }: LineChartProps) {
  const maxValue = Math.max(...data.datasets.flatMap((d) => d.values))
  const minValue = Math.min(...data.datasets.flatMap((d) => d.values))
  const range = maxValue - minValue

  // Chart dimensions
  const height = 150
  const width = 300
  const padding = { top: 10, right: 10, bottom: 30, left: 30 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate point positions
  const getX = (index: number) => {
    return padding.left + (index / (data.labels.length - 1)) * chartWidth
  }

  const getY = (value: number) => {
    return height - padding.bottom - ((value - minValue) / range) * chartHeight
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>

      <div className="relative" style={{ height: `${height}px`, width: `${width}px` }}>
        <svg width={width} height={height}>
          {/* Y-axis grid lines */}
          {[0, 1, 2, 3, 4].map((tick, i) => {
            const y = padding.top + (chartHeight / 4) * i
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e8e8ea" strokeWidth="1" />
                <text
                  x={padding.left - 5}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#6e7191"
                >
                  {Math.round(maxValue - (i * range) / 4)}
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {data.labels.map((label, i) => (
            <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" fontSize="10" fill="#6e7191">
              {label}
            </text>
          ))}

          {/* Dataset lines and points */}
          {data.datasets.map((dataset, datasetIndex) => (
            <g key={datasetIndex}>
              <path
                d={dataset.values
                  .map((value, i) => {
                    const x = getX(i)
                    const y = getY(value)
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`
                  })
                  .join(" ")}
                fill="none"
                stroke={dataset.color}
                strokeWidth="2"
              />

              {dataset.values.map((value, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(value)}
                  r="4"
                  fill="white"
                  stroke={dataset.color}
                  strokeWidth="2"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 justify-center">
        {data.datasets.map((dataset, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dataset.color }} />
            <span className="text-xs">{dataset.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

