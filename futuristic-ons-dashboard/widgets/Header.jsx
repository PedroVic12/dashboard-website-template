"use client"

import { useEffect, useState } from "react"
import { Bell, Search, User, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header({ collapsed, title = "Dashboard de Energia", subtitle }) {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    function update() {
      const now = new Date()
      setCurrentDate(now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
      setCurrentTime(now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 h-20 glass border-b border-[#00b4d8]/10 z-40 flex items-center justify-between px-8 transition-all duration-300",
        collapsed ? "left-20" : "left-64"
      )}
    >
      {/* Left Section */}
      <div>
        <h2 className="text-2xl font-bold text-white text-balance">{title}</h2>
        <div className="flex items-center gap-2 text-sm text-[#8b9cb8]">
          <Calendar className="w-4 h-4" />
          <span>{subtitle || `${currentDate} - ${currentTime}`}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9cb8]" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 pl-10 pr-4 py-2 rounded-lg bg-[#1e293b]/50 border border-[#00b4d8]/10 text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-[#1e293b]/50 border border-[#00b4d8]/10 text-[#8b9cb8] hover:text-white hover:border-[#00b4d8]/30 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#00b4d8] rounded-full animate-pulse" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#00b4d8]/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Operador</p>
            <p className="text-xs text-[#8b9cb8]">Centro de Controle</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}
