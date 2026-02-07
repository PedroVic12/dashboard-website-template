"use client"

import { cn } from "@/lib/utils"

export function GlassCard({ children, className, glow = false, ...props }) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300 hover:border-[#00b4d8]/30",
        glow && "glow-cyan",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlassCardHeader({ children, className }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  )
}

export function GlassCardTitle({ children, className }) {
  return (
    <h3 className={cn("text-sm font-medium text-[#8b9cb8] uppercase tracking-wide", className)}>
      {children}
    </h3>
  )
}

export function GlassCardValue({ children, className, color = "cyan" }) {
  const colorClasses = {
    cyan: "text-[#00b4d8]",
    green: "text-[#4ade80]",
    yellow: "text-[#facc15]",
    orange: "text-[#f97316]",
    white: "text-white"
  }
  
  return (
    <p className={cn("text-3xl font-bold font-['var(--font-space-grotesk)']", colorClasses[color], className)}>
      {children}
    </p>
  )
}
