"use client"

import { useState } from "react"
import { DashboardLayout } from "@/widgets/DashboardLayout"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/widgets/GlassCard"
import { StatsCard } from "@/widgets/StatsCard"
import { RealtimeGauge } from "@/widgets/RealtimeGauge"
import { Sun, TrendingUp, Thermometer, Clock, MapPin, ChevronDown, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from "recharts"

const dailyCurve = [
  { hora: "05:00", geracao: 0, irradiancia: 0 },
  { hora: "06:00", geracao: 800, irradiancia: 120 },
  { hora: "07:00", geracao: 3500, irradiancia: 320 },
  { hora: "08:00", geracao: 8200, irradiancia: 520 },
  { hora: "09:00", geracao: 14500, irradiancia: 680 },
  { hora: "10:00", geracao: 20800, irradiancia: 820 },
  { hora: "11:00", geracao: 25400, irradiancia: 920 },
  { hora: "12:00", geracao: 28500, irradiancia: 980 },
  { hora: "13:00", geracao: 27200, irradiancia: 950 },
  { hora: "14:00", geracao: 24100, irradiancia: 880 },
  { hora: "15:00", geracao: 19500, irradiancia: 740 },
  { hora: "16:00", geracao: 13200, irradiancia: 560 },
  { hora: "17:00", geracao: 6800, irradiancia: 320 },
  { hora: "18:00", geracao: 1500, irradiancia: 100 },
  { hora: "19:00", geracao: 0, irradiancia: 0 },
]

const monthlyData = [
  { mes: "Jan", geracao: 4200, capacidade: 5500 },
  { mes: "Fev", geracao: 4500, capacidade: 5500 },
  { mes: "Mar", geracao: 4100, capacidade: 5500 },
  { mes: "Abr", geracao: 3800, capacidade: 5500 },
  { mes: "Mai", geracao: 3200, capacidade: 5500 },
  { mes: "Jun", geracao: 2800, capacidade: 5500 },
  { mes: "Jul", geracao: 2900, capacidade: 5500 },
  { mes: "Ago", geracao: 3400, capacidade: 5500 },
  { mes: "Set", geracao: 3900, capacidade: 5500 },
  { mes: "Out", geracao: 4300, capacidade: 5500 },
  { mes: "Nov", geracao: 4600, capacidade: 5500 },
  { mes: "Dez", geracao: 4400, capacidade: 5500 },
]

const solarPlants = [
  { id: 1, name: "Parque Solar Nova Olinda", state: "PI", capacity: 292, generation: 245, efficiency: 84, irradiance: 5.8, panels: 850000, area: 690, status: "online" },
  { id: 2, name: "Usina Solar Pirapora", state: "MG", capacity: 321, generation: 278, efficiency: 87, irradiance: 5.5, panels: 1200000, area: 800, status: "online" },
  { id: 3, name: "Parque Solar Bom Jesus da Lapa", state: "BA", capacity: 158, generation: 132, efficiency: 84, irradiance: 5.9, panels: 480000, area: 350, status: "online" },
  { id: 4, name: "Complexo Solar Coremas", state: "PB", capacity: 210, generation: 175, efficiency: 83, irradiance: 5.7, panels: 620000, area: 480, status: "online" },
  { id: 5, name: "UFV Guanambi Solar", state: "BA", capacity: 150, generation: 118, efficiency: 79, irradiance: 5.6, panels: 450000, area: 320, status: "maintenance" },
  { id: 6, name: "Parque Solar Sao Goncalo", state: "PI", capacity: 475, generation: 395, efficiency: 83, irradiance: 5.9, panels: 1420000, area: 1100, status: "online" },
  { id: 7, name: "UFV Janauba", state: "MG", capacity: 180, generation: 155, efficiency: 86, irradiance: 5.4, panels: 540000, area: 390, status: "online" },
  { id: 8, name: "Parque Solar Lapa", state: "BA", capacity: 158, generation: 130, efficiency: 82, irradiance: 5.8, panels: 475000, area: 345, status: "online" },
]

const regionIrradiance = [
  { regiao: "Nordeste", valor: 5.9, cor: "#facc15" },
  { regiao: "Sudeste", valor: 5.2, cor: "#f97316" },
  { regiao: "Centro-Oeste", valor: 5.4, cor: "#00b4d8" },
  { regiao: "Norte", valor: 4.8, cor: "#4ade80" },
  { regiao: "Sul", valor: 4.5, cor: "#3b82f6" },
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
            <span className="text-white font-medium">
              {entry.dataKey === "irradiancia" ? `${entry.value} W/m2` : `${formatNumber(entry.value)} MW`}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function SolarPage() {
  const totalCapacity = solarPlants.reduce((s, p) => s + p.capacity, 0)
  const totalGeneration = solarPlants.reduce((s, p) => s + p.generation, 0)
  const avgEfficiency = Math.round(solarPlants.reduce((s, p) => s + p.efficiency, 0) / solarPlants.length)

  return (
    <DashboardLayout title="Usinas Solares" subtitle="Monitoramento da geracao fotovoltaica">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Capacidade Instalada"
          value={formatNumber(totalCapacity)}
          unit="MW"
          trend="up"
          trendValue="+18.2%"
          icon={Sun}
          color="yellow"
          sparkline={[15, 18, 22, 25, 28, 32, 38, 42, 48, 52, 56, 60]}
        />
        <StatsCard
          title="Geracao Atual"
          value={formatNumber(totalGeneration)}
          unit="MW"
          trend="up"
          trendValue="+12.5%"
          icon={TrendingUp}
          color="cyan"
          sparkline={[0, 5, 15, 28, 42, 58, 68, 62, 48, 25, 8, 0]}
        />
        <StatsCard
          title="Irradiancia Media"
          value="5.6"
          unit="kWh/m2"
          icon={Thermometer}
          color="orange"
          sparkline={[4.2, 4.5, 5.0, 5.3, 5.6, 5.8, 5.9, 5.7, 5.4, 5.1, 4.8, 4.5]}
        />
        <StatsCard
          title="Eficiencia Media"
          value={`${avgEfficiency}`}
          unit="%"
          trend="up"
          trendValue="+1.2%"
          icon={Clock}
          color="green"
          sparkline={[78, 80, 81, 82, 83, 84, 83, 84, 85, 84, 84, 83]}
        />
      </div>

      {/* Daily Curve + Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="lg:col-span-2">
          <GlassCardHeader>
            <GlassCardTitle>Curva de Geracao Solar Diaria</GlassCardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#facc15]" />
                <span className="text-xs text-[#8b9cb8]">Geracao (MW)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                <span className="text-xs text-[#8b9cb8]">Irradiancia (W/m2)</span>
              </div>
            </div>
          </GlassCardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hora" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis yAxisId="left" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="geracao" name="Geracao" stroke="#facc15" strokeWidth={2} fillOpacity={1} fill="url(#colorSolar)" />
                <Line yAxisId="right" type="monotone" dataKey="irradiancia" name="Irradiancia" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Irradiance by Region */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Irradiancia por Regiao</GlassCardTitle>
          </GlassCardHeader>
          <div className="space-y-5 mt-2">
            {regionIrradiance.map((r) => (
              <div key={r.regiao}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{r.regiao}</span>
                  <span className="text-sm font-bold" style={{ color: r.cor }}>{r.valor} kWh/m2</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#1e293b]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(r.valor / 6.5) * 100}%`,
                      backgroundColor: r.cor,
                      boxShadow: `0 0 8px ${r.cor}50`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e293b]">
            <RealtimeGauge title="Geracao Atual vs Pico" value={totalGeneration} maxValue={totalCapacity} unit="MW" color="#facc15" />
          </div>
        </GlassCard>
      </div>

      {/* Monthly Performance */}
      <GlassCard className="mb-8">
        <GlassCardHeader>
          <GlassCardTitle>Desempenho Mensal (GWh)</GlassCardTitle>
        </GlassCardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="mes" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
              <YAxis stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="geracao" name="Geracao" fill="#facc15" fillOpacity={0.8} radius={[4, 4, 0, 0]} barSize={24}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill="#facc15" fillOpacity={entry.geracao > 4000 ? 1 : 0.6} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="capacidade" name="Capacidade" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Plants Table */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Usinas Solares em Operacao</GlassCardTitle>
          <span className="text-xs text-[#8b9cb8]">{solarPlants.length} usinas monitoradas</span>
        </GlassCardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Usina</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Capacidade</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Geracao</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Eficiencia</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Irradiancia</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Paineis</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {solarPlants.map((plant) => (
                <tr key={plant.id} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#facc15]/10">
                        <Sun className="w-4 h-4 text-[#facc15]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{plant.name}</p>
                        <p className="text-xs text-[#8b9cb8]">{plant.state} - {plant.area} ha</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-white">{plant.capacity} MW</td>
                  <td className="py-4 px-4 text-sm text-[#facc15] font-medium">{plant.generation} MW</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-[#1e293b]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${plant.efficiency}%`,
                            backgroundColor: plant.efficiency >= 85 ? "#4ade80" : plant.efficiency >= 80 ? "#facc15" : "#f97316"
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#8b9cb8]">{plant.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-white">{plant.irradiance} kWh/m2</td>
                  <td className="py-4 px-4 text-sm text-[#8b9cb8]">{(plant.panels / 1000).toFixed(0)}k</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      plant.status === "online" ? "bg-[#4ade80]/20 text-[#4ade80]" : "bg-yellow-500/20 text-yellow-500"
                    )}>
                      {plant.status === "online" ? "Online" : "Manutencao"}
                    </span>
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
