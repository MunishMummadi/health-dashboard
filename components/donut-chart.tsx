interface DonutChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
  title: string
  size?: number
}

export function DonutChart({ data, title, size = 160 }: DonutChartProps) {
  // Filter out any items with NaN values and ensure all values are numbers
  const validData = data.filter((item) => !isNaN(item.value) && item.value > 0)

  const total = validData.reduce((acc, item) => acc + item.value, 0)
  let cumulativePercent = 0
  const radius = size / 2
  const innerRadius = radius * 0.6
  const center = size / 2

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {validData.map((item, i) => {
              const startPercent = cumulativePercent
              const percent = (item.value / total) * 100
              cumulativePercent += percent

              // Convert percentages to angles
              const startAngle = (startPercent / 100) * 360
              const angle = (percent / 100) * 360

              // Convert angles to radians
              const startRad = (startAngle - 90) * (Math.PI / 180)
              const endRad = (startAngle + angle - 90) * (Math.PI / 180)

              // Calculate outer arc coordinates
              const x1 = center + radius * Math.cos(startRad)
              const y1 = center + radius * Math.sin(startRad)
              const x2 = center + radius * Math.cos(endRad)
              const y2 = center + radius * Math.sin(endRad)

              // Calculate inner arc coordinates
              const x3 = center + innerRadius * Math.cos(endRad)
              const y3 = center + innerRadius * Math.sin(endRad)
              const x4 = center + innerRadius * Math.cos(startRad)
              const y4 = center + innerRadius * Math.sin(startRad)

              // Create path
              const largeArcFlag = angle > 180 ? 1 : 0
              const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                "Z",
              ].join(" ")

              return <path key={i} d={pathData} fill={item.color} />
            })}
            <circle cx={center} cy={center} r={innerRadius} fill="white" />
          </svg>

          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ width: `${size}px`, height: `${size}px` }}
          >
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {validData.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm">{item.name}</span>
              <span className="text-sm font-medium ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

