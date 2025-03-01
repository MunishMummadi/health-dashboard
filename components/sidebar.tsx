"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, FileText, Home, LogOut, Settings, Users } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="h-screen w-[120px] bg-sidebar-bg flex flex-col border-r">
      <div className="p-4 text-center">
        <h1 className="text-primary font-bold text-sm">Healthcare Analytics</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-2 py-4">
        <NavItem href="/" icon={<Home size={20} />} label="Dashboard" isActive={isActive("/")} />
        <NavItem href="/reports" icon={<FileText size={20} />} label="Reports" isActive={isActive("/reports")} />
        <NavItem href="/analytics" icon={<BarChart2 size={20} />} label="Analytics" isActive={isActive("/analytics")} />
        <NavItem href="/patients" icon={<Users size={20} />} label="Patient Records" isActive={isActive("/patients")} />
        <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" isActive={isActive("/settings")} />
      </nav>

      <div className="p-4 mt-auto">
        <button className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-gray-700 transition-colors">
          <LogOut size={20} />
          <span className="text-xs mt-1">Log out</span>
        </button>
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
      className={`flex flex-col items-center justify-center p-3 rounded-md transition-colors ${
        isActive ? "bg-sidebar-active text-sidebar-activeFg" : "text-gray-600 hover:bg-sidebar-hover"
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  )
}

