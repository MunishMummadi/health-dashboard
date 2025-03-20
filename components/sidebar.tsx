"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, FileText, Home, Activity } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="h-screen w-[80px] bg-sidebar-bg flex flex-col border-r shadow-sm">
      <div className="p-3 text-center">
        <div className="w-12 h-12 bg-primary rounded-full mx-auto flex items-center justify-center">
          <span className="text-white font-bold text-lg">HC</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-2 py-4">
        <NavItem href="/" icon={<Home size={20} />} label="Home" isActive={isActive("/")} />
        <NavItem href="/analytics" icon={<BarChart2 size={20} />} label="Analytics" isActive={isActive("/analytics")} />
        <NavItem href="/reports" icon={<FileText size={20} />} label="Reports" isActive={isActive("/reports")} />
      </nav>

      <div className="p-3 text-center text-xs text-gray-500">
        <div className="w-10 h-10 rounded-full bg-gray-100 mx-auto flex items-center justify-center">
          <Activity size={16} className="text-primary" />
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
        isActive ? "bg-sidebar-active text-sidebar-activeFg" : "text-gray-600 hover:bg-sidebar-hover"
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  )
}

