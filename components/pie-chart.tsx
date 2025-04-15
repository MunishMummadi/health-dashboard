interface PieChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
  title: string
}

export function PieChart({ data, title }: PieChartProps) {
  // Filter out any items with NaN values and ensure all values are numbers
  const validData = data.filter((item) => !isNaN(item.value) && item.value > 0)

  const total = validData.reduce((acc, item) => acc + item.value, 0)
  let cumulativePercent = 0

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-[120px] h-[120px]">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {validData.map((item, i) => {
              const startPercent = cumulativePercent
              const percent = (item.value / total) * 100
              cumulativePercent += percent

              return <PieSlice key={i} startPercent={startPercent} percent={percent} color={item.color} />
            })}
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          {validData.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface PieSliceProps {
  startPercent: number
  percent: number
  color: string
}

function PieSlice({ startPercent, percent, color }: PieSliceProps) {
  const center = 60
  const radius = 50

  // Convert percentages to angles
  const startAngle = (startPercent / 100) * 360
  const angle = (percent / 100) * 360

  // Convert angles to radians
  const startRad = (startAngle - 90) * (Math.PI / 180)
  const endRad = (startAngle + angle - 90) * (Math.PI / 180)

  // Calculate path coordinates
  const x1 = center + radius * Math.cos(startRad)
  const y1 = center + radius * Math.sin(startRad)
  const x2 = center + radius * Math.cos(endRad)
  const y2 = center + radius * Math.sin(endRad)

  // Create path
  const largeArcFlag = angle > 180 ? 1 : 0
  const pathData = [
    `M ${center} ${center}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    "Z",
  ].join(" ")

  return <path d={pathData} fill={color} />
}

