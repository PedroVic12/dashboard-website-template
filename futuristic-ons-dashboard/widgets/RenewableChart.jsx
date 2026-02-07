"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "./GlassCard"
import { formatNumber } from "@/lib/format"

const data = [
  { name: "Solar", valor: 28500, meta: 35000, cor: "#facc15" },
  { name: "Eólica", valor: 22800, meta: 25000, cor: "#00b4d8" },
  { name: "Hidráulica", valor: 68000, meta: 75000, cor: "#3b82f6" },
  { name: "Biomassa", valor: 8500, meta: 10000, cor: "#4ade80" },
  { name: "Nuclear", valor: 2000, meta: 2000, cor: "#a855f7" },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="glass-card rounded-lg p-3 border border-[#00b4d8]/30">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8b9cb8]">Geração atual:</span>
            <span className="text-white font-medium">
              {formatNumber(item.value)} MW
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8b9cb8]">Meta:</span>
            <span className="text-[#00b4d8] font-medium">
              {formatNumber(item.payload.meta)} MW
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function RenewableChart() {
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Matriz Energética</GlassCardTitle>
        <span className="text-xs text-[#8b9cb8]">Capacidade instalada</span>
      </GlassCardHeader>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#8b9cb8" 
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: '#1e293b' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#8b9cb8" 
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: '#1e293b' }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="valor" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with percentages */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1e293b]">
        {data.slice(0, 3).map((item) => (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.cor }} />
              <span className="text-xs text-[#8b9cb8]">{item.name}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: item.cor }}>
              {((item.valor / item.meta) * 100).toFixed(0)}%
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
