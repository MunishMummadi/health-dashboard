import type { LucideIcon } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string
  icon: LucideIcon
  color: string
}

export function AnalyticsCard({ title, value, icon: Icon, color }: AnalyticsCardProps) {
  // Ensure value is not NaN if it's a numeric string
  const displayValue = value === "NaN" ? "0" : value

  return (
    <div className="bg-white rounded-lg p-4 border flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-lg font-semibold">{displayValue}</p>
      </div>
    </div>
  )
}

