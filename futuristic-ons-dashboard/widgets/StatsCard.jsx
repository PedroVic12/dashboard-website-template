"use client"

import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"

export function StatsCard({ 
  title, 
  value, 
  unit, 
  trend, 
  trendValue, 
  icon: Icon,
  color = "cyan",
  sparkline = []
}) {
  const colorMap = {
    cyan: {
      bg: "bg-[#00b4d8]/10",
      text: "text-[#00b4d8]",
      border: "border-[#00b4d8]/20",
      glow: "glow-cyan"
    },
    green: {
      bg: "bg-[#4ade80]/10",
      text: "text-[#4ade80]",
      border: "border-[#4ade80]/20",
      glow: "glow-green"
    },
    yellow: {
      bg: "bg-[#facc15]/10",
      text: "text-[#facc15]",
      border: "border-[#facc15]/20",
      glow: "glow-yellow"
    },
    orange: {
      bg: "bg-[#f97316]/10",
      text: "text-[#f97316]",
      border: "border-[#f97316]/20",
      glow: ""
    }
  }

  const colors = colorMap[color]

  return (
    <div className={cn(
      "glass-card rounded-xl p-6 transition-all duration-300 hover:border-[#00b4d8]/30 group",
      colors.border
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-[#8b9cb8] uppercase tracking-wide mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", colors.text)}>
              {value}
            </span>
            <span className="text-sm text-[#8b9cb8]">{unit}</span>
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-lg transition-all duration-300",
          colors.bg,
          "group-hover:scale-110"
        )}>
          <Icon className={cn("w-6 h-6", colors.text)} />
        </div>
      </div>

      {/* Sparkline */}
      {sparkline.length > 0 && (
        <div className="h-12 flex items-end gap-1 mb-4">
          {sparkline.map((val, i) => (
            <div
              key={i}
              className={cn("flex-1 rounded-t transition-all duration-300", colors.bg)}
              style={{ height: `${(val / Math.max(...sparkline)) * 100}%` }}
            />
          ))}
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-2 pt-4 border-t border-[#1e293b]">
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend === "up" ? "text-[#4ade80]" : "text-[#f87171]"
          )}>
            {trend === "up" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {trendValue}
          </div>
          <span className="text-xs text-[#8b9cb8]">vs. hora anterior</span>
        </div>
      )}
    </div>
  )
}
