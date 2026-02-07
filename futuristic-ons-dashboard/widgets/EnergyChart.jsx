"use client"

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "./GlassCard"
import { formatNumber } from "@/lib/format"

const data = [
  { hora: "00:00", geracao: 52000, consumo: 48000, solar: 0, eolica: 8500 },
  { hora: "02:00", geracao: 48000, consumo: 42000, solar: 0, eolica: 9200 },
  { hora: "04:00", geracao: 45000, consumo: 40000, solar: 0, eolica: 10100 },
  { hora: "06:00", geracao: 52000, consumo: 48000, solar: 2500, eolica: 11500 },
  { hora: "08:00", geracao: 62000, consumo: 58000, solar: 12000, eolica: 9800 },
  { hora: "10:00", geracao: 72000, consumo: 68000, solar: 22000, eolica: 7200 },
  { hora: "12:00", geracao: 78000, consumo: 74000, solar: 28000, eolica: 6500 },
  { hora: "14:00", geracao: 76000, consumo: 72000, solar: 26000, eolica: 7800 },
  { hora: "16:00", geracao: 70000, consumo: 66000, solar: 18000, eolica: 9500 },
  { hora: "18:00", geracao: 74000, consumo: 78000, solar: 5000, eolica: 11200 },
  { hora: "20:00", geracao: 72000, consumo: 76000, solar: 0, eolica: 12500 },
  { hora: "22:00", geracao: 58000, consumo: 54000, solar: 0, eolica: 10800 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 border border-[#00b4d8]/30">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }} 
            />
            <span className="text-[#8b9cb8]">{entry.name}:</span>
            <span className="text-white font-medium">
              {formatNumber(entry.value)} MW
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function EnergyChart() {
  return (
    <GlassCard className="col-span-2">
      <GlassCardHeader>
        <GlassCardTitle>Geração e Consumo de Energia</GlassCardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00b4d8]" />
            <span className="text-xs text-[#8b9cb8]">Geração</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f97316]" />
            <span className="text-xs text-[#8b9cb8]">Consumo</span>
          </div>
        </div>
      </GlassCardHeader>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGeracao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#00b4d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="hora" 
              stroke="#8b9cb8" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis 
              stroke="#8b9cb8" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#1e293b' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="geracao" 
              name="Geração"
              stroke="#00b4d8" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorGeracao)" 
            />
            <Area 
              type="monotone" 
              dataKey="consumo" 
              name="Consumo"
              stroke="#f97316" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorConsumo)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
