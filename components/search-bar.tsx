import type React from 'react';
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      <Input
        value={value}
        onChange={onChange}
        className="pl-10 pr-10 h-10 bg-white rounded-md border border-gray-200"
        placeholder="Search any keywords..."
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <kbd className="px-1.5 py-0.5 text-xs border rounded-md bg-gray-50">⌘K</kbd>
      </div>
    </div>
  )
}
