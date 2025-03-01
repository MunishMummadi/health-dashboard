"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateSelectorProps {
  date?: Date
  onSelect?: (date: Date) => void
  className?: string
}

export function DateSelector({ date, onSelect, className }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string>(date ? formatDate(date) : formatDate(new Date()))

  function formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedDate(e.target.value)
    if (onSelect && e.target.value) {
      onSelect(new Date(e.target.value))
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? new Date(selectedDate).toLocaleDateString() : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Input type="date" value={selectedDate} onChange={handleDateChange} className="w-full" />
        </PopoverContent>
      </Popover>
    </div>
  )
}

