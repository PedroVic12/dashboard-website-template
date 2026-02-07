"use client"

import { useEffect, useState } from "react"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "./GlassCard"
import { formatNumber } from "@/lib/format"

export function RealtimeGauge({ title, value, maxValue, unit, color = "#00b4d8" }) {
  const [animatedValue, setAnimatedValue] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100)
    return () => clearTimeout(timer)
  }, [value])

  const percentage = (animatedValue / maxValue) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75

  return (
    <GlassCard className="text-center">
      <GlassCardHeader className="justify-center">
        <GlassCardTitle>{title}</GlassCardTitle>
      </GlassCardHeader>

      <div className="relative inline-flex items-center justify-center">
        <svg className="w-40 h-40 -rotate-[135deg]" viewBox="0 0 100 100">
          {/* Background arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color})`
            }}
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-3xl font-bold"
            style={{ color }}
          >
            {formatNumber(animatedValue)}
          </span>
          <span className="text-sm text-[#8b9cb8]">{unit}</span>
        </div>
      </div>

      <div className="flex justify-between mt-4 px-4 text-xs text-[#8b9cb8]">
        <span>0</span>
        <span>{formatNumber(maxValue)} {unit}</span>
      </div>
    </GlassCard>
  )
}
