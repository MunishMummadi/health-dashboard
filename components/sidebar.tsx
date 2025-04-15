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
    <div className="h-screen w-[80px] bg-gradient-to-b from-sidebar-bg to-sidebar-bg/95 flex flex-col border-r border-gray-200/30 shadow-lg">
      <div className="p-4 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl mx-auto flex items-center justify-center shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
          <span className="text-white font-bold text-lg">HC</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-3 px-3 py-6">
        <NavItem href="/" icon={<Home size={20} />} label="Home" isActive={isActive("/")} />
        <NavItem href="/analytics" icon={<BarChart2 size={20} />} label="Analytics" isActive={isActive("/analytics")} />
        <NavItem href="/reports" icon={<FileText size={20} />} label="Reports" isActive={isActive("/reports")} />
      </nav>

      <div className="p-4 pb-6 text-center text-xs text-gray-500">
        <div className="w-10 h-10 rounded-lg bg-gray-100/80 backdrop-blur-sm mx-auto flex items-center justify-center shadow-sm hover:shadow transition-all duration-200">
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
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? "bg-sidebar-active text-sidebar-activeFg shadow-md shadow-sidebar-active/20" 
          : "text-gray-500 hover:bg-sidebar-hover/70 hover:text-gray-700 hover:shadow-sm"
      }`}
    >
      <div className="relative">
        {icon}
        {isActive && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-glow"></span>
        )}
      </div>
      <span className={`text-xs mt-1.5 font-medium ${isActive ? "font-semibold" : ""}`}>{label}</span>
    </Link>
  )
}

