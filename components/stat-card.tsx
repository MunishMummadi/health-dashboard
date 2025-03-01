interface StatCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    direction: "up" | "down"
  }
}

export function StatCard({ title, value, trend }: StatCardProps) {
  return (
    <div className="flex flex-col">
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold">{value}</span>
        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend.direction === "up" ? "text-success" : "text-destructive"
            }`}
          >
            <span>{trend.direction === "up" ? "↑" : "↓"}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

