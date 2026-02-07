"use client"

import { GlassCard, GlassCardHeader, GlassCardTitle } from "./GlassCard"
import { cn } from "@/lib/utils"

const transmissionLines = [
  { id: 1, from: "Norte", to: "Nordeste", capacity: 4500, load: 78, status: "normal" },
  { id: 2, from: "Nordeste", to: "Sudeste", capacity: 8000, load: 85, status: "high" },
  { id: 3, from: "Sudeste", to: "Sul", capacity: 6000, load: 62, status: "normal" },
  { id: 4, from: "Centro-Oeste", to: "Sudeste", capacity: 5500, load: 71, status: "normal" },
  { id: 5, from: "Norte", to: "Centro-Oeste", capacity: 3500, load: 92, status: "critical" },
]

const regions = [
  { name: "Norte", x: 25, y: 15, power: "12.5 GW" },
  { name: "Nordeste", x: 70, y: 20, power: "18.3 GW" },
  { name: "Centro-Oeste", x: 40, y: 45, power: "9.8 GW" },
  { name: "Sudeste", x: 65, y: 60, power: "45.2 GW" },
  { name: "Sul", x: 50, y: 85, power: "15.7 GW" },
]

export function TransmissionMap() {
  const getStatusColor = (status) => {
    switch (status) {
      case "critical": return "text-red-500 bg-red-500/20"
      case "high": return "text-yellow-500 bg-yellow-500/20"
      default: return "text-[#4ade80] bg-[#4ade80]/20"
    }
  }

  const getLoadColor = (load) => {
    if (load >= 90) return "#ef4444"
    if (load >= 75) return "#facc15"
    return "#4ade80"
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Linhas de Transmissão</GlassCardTitle>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
            <span className="text-xs text-[#8b9cb8]">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-[#8b9cb8]">Alto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-[#8b9cb8]">Crítico</span>
          </div>
        </div>
      </GlassCardHeader>

      {/* Simplified Brazil Map */}
      <div className="relative h-64 mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Connection Lines */}
          <line x1="25" y1="15" x2="70" y2="20" stroke="#1e293b" strokeWidth="2" />
          <line x1="70" y1="20" x2="65" y2="60" stroke="#facc15" strokeWidth="2" strokeOpacity="0.6" />
          <line x1="65" y1="60" x2="50" y2="85" stroke="#1e293b" strokeWidth="2" />
          <line x1="40" y1="45" x2="65" y2="60" stroke="#1e293b" strokeWidth="2" />
          <line x1="25" y1="15" x2="40" y2="45" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.8" />

          {/* Animated pulses on lines */}
          <circle className="animate-pulse" cx="47" cy="17" r="2" fill="#00b4d8" />
          <circle className="animate-pulse" cx="67" cy="40" r="2" fill="#facc15" />
          <circle className="animate-pulse" cx="57" cy="72" r="2" fill="#4ade80" />
          <circle className="animate-pulse" cx="52" cy="52" r="2" fill="#00b4d8" />
          <circle className="animate-pulse" cx="32" cy="30" r="2" fill="#ef4444" />

          {/* Region Nodes */}
          {regions.map((region) => (
            <g key={region.name}>
              <circle
                cx={region.x}
                cy={region.y}
                r="6"
                className="fill-[#00b4d8]/30 stroke-[#00b4d8]"
                strokeWidth="1.5"
              />
              <circle
                cx={region.x}
                cy={region.y}
                r="3"
                className="fill-[#00b4d8]"
              />
            </g>
          ))}
        </svg>

        {/* Region Labels */}
        {regions.map((region) => (
          <div
            key={region.name}
            className="absolute text-center transform -translate-x-1/2"
            style={{ left: `${region.x}%`, top: `${region.y + 8}%` }}
          >
            <p className="text-xs font-medium text-white">{region.name}</p>
            <p className="text-[10px] text-[#00b4d8]">{region.power}</p>
          </div>
        ))}
      </div>

      {/* Transmission Lines List */}
      <div className="space-y-3">
        {transmissionLines.map((line) => (
          <div 
            key={line.id} 
            className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/30 hover:bg-[#1e293b]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", getStatusColor(line.status).split(' ')[0].replace('text-', 'bg-'))} />
              <span className="text-sm text-white">
                {line.from} → {line.to}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#8b9cb8]">{line.capacity} MW</span>
              <div className="w-24 h-2 rounded-full bg-[#1e293b]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${line.load}%`,
                    backgroundColor: getLoadColor(line.load)
                  }}
                />
              </div>
              <span 
                className="text-xs font-medium w-10 text-right"
                style={{ color: getLoadColor(line.load) }}
              >
                {line.load}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
