interface StatCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    direction: "up" | "down"
  }
}

export function StatCard({ title, value, trend }: StatCardProps) {
  // Ensure value is not NaN
  const displayValue = typeof value === "number" && isNaN(value) ? "0" : value

  return (
    <div className="flex flex-col">
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold">{displayValue}</span>
        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend.direction === "up" ? "text-success" : "text-destructive"
            }`}
          >
            <span>{trend.direction === "up" ? "↑" : "↓"}</span>
            <span>{isNaN(trend.value) ? "0" : trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

