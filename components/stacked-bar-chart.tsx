interface StackedBarChartProps {
  data: {
    category: string
    values: {
      name: string
      value: number
      color: string
    }[]
  }[]
  title: string
  legend?: { name: string; color: string }[]
}

export function StackedBarChart({ data, title, legend }: StackedBarChartProps) {
  // Calculate the maximum total value for scaling
  const maxTotal = Math.max(...data.map((item) => item.values.reduce((sum, val) => sum + val.value, 0)))

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium mb-4">{title}</h3>

      <div className="space-y-4">
        {data.map((item, i) => {
          const total = item.values.reduce((sum, val) => sum + val.value, 0)

          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{item.category}</span>
                <span className="font-medium">{total}</span>
              </div>
              <div className="w-full h-6 flex rounded-md overflow-hidden">
                {item.values.map((value, j) => (
                  <div
                    key={j}
                    className="h-full"
                    style={{
                      width: `${(value.value / total) * 100}%`,
                      backgroundColor: value.color,
                    }}
                    title={`${value.name}: ${value.value}`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {legend && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {legend.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

