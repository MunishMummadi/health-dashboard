interface HorizontalBarChartProps {
  data: {
    label: string
    value: number
    color: string
  }[]
  title: string
  maxValue?: number
}

export function HorizontalBarChart({ data, title, maxValue }: HorizontalBarChartProps) {
  // Calculate max value if not provided
  const calculatedMax = maxValue || Math.max(...data.map((item) => item.value))

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(item.value / calculatedMax) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

