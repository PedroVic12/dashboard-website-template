"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Zap, 
  Activity, 
  Sun, 
  Wind, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Gauge
} from "lucide-react"

const menuItems = [
  { icon: Gauge, label: "Visao Geral", href: "/" },
  { icon: Zap, label: "Energia Eletrica", href: "/energia" },
  { icon: Activity, label: "Linhas de Transmissao", href: "/transmissao" },
  { icon: Sun, label: "Usinas Solares", href: "/solar" },
  { icon: Wind, label: "Usinas Eolicas", href: "/eolica" },
  { icon: BarChart3, label: "Relatorios", href: "/relatorios" },
]

export function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname()

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen glass-card border-r border-[#00b4d8]/10 transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#00b4d8]/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center glow-cyan flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">ONS</h1>
              <p className="text-xs text-[#8b9cb8]">Sistema Nacional</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30"
                      : "text-[#8b9cb8] hover:bg-[#1e293b] hover:text-white border border-transparent"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[#00b4d8]/10">
        <Link 
          href="/configuracoes"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#8b9cb8] hover:bg-[#1e293b] hover:text-white transition-all duration-200"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Configuracoes</span>}
        </Link>
        
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-lg text-[#8b9cb8] hover:bg-[#1e293b] hover:text-white transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  )
}
