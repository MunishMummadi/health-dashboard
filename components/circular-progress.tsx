interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color: string
  label: string
  trend?: {
    value: number
    direction: "up" | "down"
  }
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 10,
  color,
  label,
  trend,
}: CircularProgressProps) {
  // Ensure percentage is a valid number
  const safePercentage = isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage))

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const dash = (safePercentage * circumference) / 100

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e8e8ea"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{safePercentage}%</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-medium">{label}</p>
        {trend && (
          <div
            className={`flex items-center justify-center mt-1 text-xs font-medium ${
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

