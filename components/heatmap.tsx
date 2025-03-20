interface HeatmapProps {
  data: {
    x: string
    y: string
    value: number
  }[]
  xLabels: string[]
  yLabels: string[]
  title: string
  colorScale?: string[]
}

export function Heatmap({ data, xLabels, yLabels, title, colorScale = ["#f7fafc", "#7a40f2"] }: HeatmapProps) {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map((item) => item.value))

  // Function to get color based on value
  const getColor = (value: number) => {
    const ratio = value / maxValue

    // Simple linear interpolation between two colors
    const r1 = Number.parseInt(colorScale[0].slice(1, 3), 16)
    const g1 = Number.parseInt(colorScale[0].slice(3, 5), 16)
    const b1 = Number.parseInt(colorScale[0].slice(5, 7), 16)

    const r2 = Number.parseInt(colorScale[1].slice(1, 3), 16)
    const g2 = Number.parseInt(colorScale[1].slice(3, 5), 16)
    const b2 = Number.parseInt(colorScale[1].slice(5, 7), 16)

    const r = Math.round(r1 + (r2 - r1) * ratio)
    const g = Math.round(g1 + (g2 - g1) * ratio)
    const b = Math.round(b1 + (b2 - b1) * ratio)

    return `rgb(${r}, ${g}, ${b})`
  }

  // Function to get value for a specific x,y coordinate
  const getValue = (x: string, y: string) => {
    const item = data.find((d) => d.x === x && d.y === y)
    return item ? item.value : 0
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium mb-4">{title}</h3>

      <div className="flex">
        {/* Y-axis labels */}
        <div className="flex flex-col pr-2">
          <div className="h-8" /> {/* Empty space for x-axis labels */}
          {yLabels.map((label, i) => (
            <div key={i} className="h-8 flex items-center justify-end text-xs">
              {label}
            </div>
          ))}
        </div>

        <div className="flex-1">
          {/* X-axis labels */}
          <div className="flex h-8">
            {xLabels.map((label, i) => (
              <div key={i} className="flex-1 flex items-center justify-center text-xs">
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          <div className="flex flex-col">
            {yLabels.map((yLabel, yIndex) => (
              <div key={yIndex} className="flex h-8">
                {xLabels.map((xLabel, xIndex) => {
                  const value = getValue(xLabel, yLabel)
                  return (
                    <div
                      key={xIndex}
                      className="flex-1 border border-gray-100 flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: getColor(value),
                        color: value > maxValue * 0.7 ? "white" : "black",
                      }}
                      title={`${xLabel}, ${yLabel}: ${value}`}
                    >
                      {value}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

