interface BarChartProps {
  data: {
    month: string
    values: {
      value: number
      color: string
    }[]
  }[]
  title: string
}

export function BarChart({ data, title }: BarChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => d.values.map((v) => v.value)))

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <div className="flex flex-col">
        <div className="flex-1 flex items-end gap-2">
          {data.map((item, i) => (
            <div key={i} className="flex-1 flex items-end gap-1">
              {item.values.map((value, j) => {
                const height = (value.value / maxValue) * 150
                return (
                  <div
                    key={j}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${height}px`,
                      backgroundColor: value.color,
                      minWidth: "8px",
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex mt-2 border-t pt-2">
          {data.map((item, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-xs text-gray-500">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

