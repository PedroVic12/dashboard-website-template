"use client"

import { useState } from "react"
import { DashboardLayout } from "@/widgets/DashboardLayout"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/widgets/GlassCard"
import { StatsCard } from "@/widgets/StatsCard"
import { Activity, Zap, AlertTriangle, CheckCircle, MapPin, ArrowRight, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts"

const transmissionLines = [
  { id: 1, name: "LT 500kV Tucurui - Macapa", from: "Norte", to: "Norte", voltage: 500, length: 1800, capacity: 4500, load: 78, status: "normal", company: "Eletronorte" },
  { id: 2, name: "LT 765kV Itaipu - Ibiuna", from: "Sul", to: "Sudeste", voltage: 765, length: 900, capacity: 12000, load: 85, status: "high", company: "Furnas" },
  { id: 3, name: "LT 500kV Paulo Afonso - Recife", from: "Nordeste", to: "Nordeste", voltage: 500, length: 650, capacity: 6000, load: 62, status: "normal", company: "Chesf" },
  { id: 4, name: "LT 500kV Serra da Mesa - Samambaia", from: "Centro-Oeste", to: "Sudeste", voltage: 500, length: 420, capacity: 5500, load: 71, status: "normal", company: "Furnas" },
  { id: 5, name: "LT 500kV Tucurui - Xingu", from: "Norte", to: "Centro-Oeste", voltage: 500, length: 1100, capacity: 3500, load: 92, status: "critical", company: "Eletronorte" },
  { id: 6, name: "LT 800kV Xingu - Estreito", from: "Norte", to: "Sudeste", voltage: 800, length: 2076, capacity: 8000, load: 68, status: "normal", company: "ISA CTEEP" },
  { id: 7, name: "LT 500kV Imperatriz - Colinas", from: "Norte", to: "Nordeste", voltage: 500, length: 590, capacity: 4200, load: 88, status: "high", company: "Eletronorte" },
  { id: 8, name: "LT 500kV Campos Novos - Blumenau", from: "Sul", to: "Sul", voltage: 500, length: 280, capacity: 3800, load: 45, status: "normal", company: "Eletrosul" },
]

const flowData = [
  { hora: "00:00", norte_ne: 1200, ne_se: 4500, se_s: 2800, co_se: 3200 },
  { hora: "04:00", norte_ne: 1400, ne_se: 4200, se_s: 2600, co_se: 3000 },
  { hora: "08:00", norte_ne: 2100, ne_se: 5800, se_s: 3500, co_se: 4100 },
  { hora: "12:00", norte_ne: 2800, ne_se: 6500, se_s: 4200, co_se: 4800 },
  { hora: "16:00", norte_ne: 2400, ne_se: 6100, se_s: 3800, co_se: 4500 },
  { hora: "18:00", norte_ne: 3200, ne_se: 7200, se_s: 4800, co_se: 5200 },
  { hora: "20:00", norte_ne: 2900, ne_se: 6800, se_s: 4500, co_se: 5000 },
  { hora: "22:00", norte_ne: 1800, ne_se: 5200, se_s: 3200, co_se: 3800 },
]

const regions = [
  { name: "Norte", x: 25, y: 15, power: "12.5 GW" },
  { name: "Nordeste", x: 72, y: 22, power: "18.3 GW" },
  { name: "Centro-Oeste", x: 42, y: 48, power: "9.8 GW" },
  { name: "Sudeste", x: 65, y: 62, power: "45.2 GW" },
  { name: "Sul", x: 52, y: 85, power: "15.7 GW" },
]

const connections = [
  { from: [25, 15], to: [72, 22], load: 78, color: "#00b4d8" },
  { from: [72, 22], to: [65, 62], load: 85, color: "#facc15" },
  { from: [65, 62], to: [52, 85], load: 62, color: "#4ade80" },
  { from: [42, 48], to: [65, 62], load: 71, color: "#00b4d8" },
  { from: [25, 15], to: [42, 48], load: 92, color: "#ef4444" },
  { from: [25, 15], to: [65, 62], load: 68, color: "#00b4d8" },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 border border-[#00b4d8]/30">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#8b9cb8]">{entry.name}:</span>
            <span className="text-white font-medium">{formatNumber(entry.value)} MW</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function TransmissaoPage() {
  const [filter, setFilter] = useState("all")

  const getLoadColor = (load) => {
    if (load >= 90) return "#ef4444"
    if (load >= 75) return "#facc15"
    return "#4ade80"
  }

  const getStatusBadge = (status) => {
    const config = {
      normal: { label: "Normal", bg: "bg-[#4ade80]/20", text: "text-[#4ade80]" },
      high: { label: "Alto", bg: "bg-yellow-500/20", text: "text-yellow-500" },
      critical: { label: "Critico", bg: "bg-red-500/20", text: "text-red-500" },
    }
    const c = config[status]
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", c.bg, c.text)}>
        {c.label}
      </span>
    )
  }

  const filteredLines = filter === "all"
    ? transmissionLines
    : transmissionLines.filter(l => l.status === filter)

  const criticalCount = transmissionLines.filter(l => l.status === "critical").length
  const highCount = transmissionLines.filter(l => l.status === "high").length

  return (
    <DashboardLayout title="Linhas de Transmissao" subtitle="Monitoramento do Sistema Interligado Nacional">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total de Linhas" value="184" unit="linhas" icon={Activity} color="cyan" sparkline={[]} />
        <StatsCard title="Extensao Total" value="156.284" unit="km" icon={MapPin} color="green" sparkline={[]} />
        <StatsCard title="Alertas Criticos" value={String(criticalCount)} unit="linhas" trend="up" trendValue="+1" icon={AlertTriangle} color="orange" sparkline={[]} />
        <StatsCard title="Operando Normal" value={String(transmissionLines.filter(l => l.status === "normal").length)} unit="linhas" icon={CheckCircle} color="green" sparkline={[]} />
      </div>

      {/* Map + Flow Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Interactive Map */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Mapa de Interconexoes</GlassCardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                <span className="text-xs text-[#8b9cb8]">{"< 75%"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs text-[#8b9cb8]">75-90%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-[#8b9cb8]">{"> 90%"}</span>
              </div>
            </div>
          </GlassCardHeader>

          <div className="relative h-[340px]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Grid */}
              {[20, 40, 60, 80].map(v => (
                <line key={`h-${v}`} x1="0" y1={v} x2="100" y2={v} stroke="#1e293b" strokeWidth="0.3" />
              ))}
              {[20, 40, 60, 80].map(v => (
                <line key={`v-${v}`} x1={v} y1="0" x2={v} y2="100" stroke="#1e293b" strokeWidth="0.3" />
              ))}

              {/* Connections */}
              {connections.map((conn, i) => (
                <g key={i}>
                  <line
                    x1={conn.from[0]} y1={conn.from[1]}
                    x2={conn.to[0]} y2={conn.to[1]}
                    stroke={getLoadColor(conn.load)}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <circle
                    cx={(conn.from[0] + conn.to[0]) / 2}
                    cy={(conn.from[1] + conn.to[1]) / 2}
                    r="2.5"
                    fill={getLoadColor(conn.load)}
                    className="animate-pulse"
                  />
                </g>
              ))}

              {/* Region Nodes */}
              {regions.map((r) => (
                <g key={r.name}>
                  <circle cx={r.x} cy={r.y} r="8" className="fill-[#00b4d8]/10 stroke-[#00b4d8]/30" strokeWidth="0.5" />
                  <circle cx={r.x} cy={r.y} r="4" className="fill-[#00b4d8]/40 stroke-[#00b4d8]" strokeWidth="1" />
                  <circle cx={r.x} cy={r.y} r="2" className="fill-[#00b4d8]" />
                </g>
              ))}
            </svg>

            {/* Labels */}
            {regions.map((r) => (
              <div
                key={r.name}
                className="absolute transform -translate-x-1/2 text-center"
                style={{ left: `${r.x}%`, top: `${r.y + 10}%` }}
              >
                <p className="text-xs font-semibold text-white">{r.name}</p>
                <p className="text-[10px] text-[#00b4d8]">{r.power}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Flow Over Time */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Fluxo de Intercambio (24h)</GlassCardTitle>
          </GlassCardHeader>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hora" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="norte_ne" name="N → NE" stroke="#00b4d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ne_se" name="NE → SE" stroke="#facc15" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="se_s" name="SE → S" stroke="#4ade80" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="co_se" name="CO → SE" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#1e293b]">
            {[
              { label: "N → NE", color: "#00b4d8" },
              { label: "NE → SE", color: "#facc15" },
              { label: "SE → S", color: "#4ade80" },
              { label: "CO → SE", color: "#f97316" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[#8b9cb8]">{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Transmission Lines Table */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Linhas de Transmissao Monitoradas</GlassCardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8b9cb8]" />
            {["all", "normal", "high", "critical"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                  filter === f
                    ? "bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30"
                    : "text-[#8b9cb8] hover:bg-[#1e293b] border border-transparent"
                )}
              >
                {f === "all" ? "Todos" : f === "normal" ? "Normal" : f === "high" ? "Alto" : "Critico"}
              </button>
            ))}
          </div>
        </GlassCardHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Linha</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Tensao</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Extensao</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Capacidade</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Carga</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Empresa</th>
              </tr>
            </thead>
            <tbody>
              {filteredLines.map((line) => (
                <tr key={line.id} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#00b4d8]/10">
                        <Activity className="w-4 h-4 text-[#00b4d8]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{line.name}</p>
                        <p className="text-xs text-[#8b9cb8]">{line.from} → {line.to}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-white">{line.voltage} kV</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-white">{formatNumber(line.length)} km</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-white">{formatNumber(line.capacity)} MW</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-[#1e293b]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${line.load}%`, backgroundColor: getLoadColor(line.load) }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: getLoadColor(line.load) }}>
                        {line.load}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(line.status)}</td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-[#8b9cb8]">{line.company}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </DashboardLayout>
  )
}
