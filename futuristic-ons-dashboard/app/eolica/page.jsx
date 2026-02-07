"use client"

import { DashboardLayout } from "@/widgets/DashboardLayout"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/widgets/GlassCard"
import { StatsCard } from "@/widgets/StatsCard"
import { RealtimeGauge } from "@/widgets/RealtimeGauge"
import { Wind, TrendingUp, Gauge, MapPin, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from "recharts"

const hourlyWind = [
  { hora: "00:00", geracao: 18500, velocidade: 8.2 },
  { hora: "02:00", geracao: 19200, velocidade: 8.5 },
  { hora: "04:00", geracao: 20100, velocidade: 9.0 },
  { hora: "06:00", geracao: 18800, velocidade: 8.3 },
  { hora: "08:00", geracao: 15200, velocidade: 6.8 },
  { hora: "10:00", geracao: 12100, velocidade: 5.5 },
  { hora: "12:00", geracao: 10500, velocidade: 4.8 },
  { hora: "14:00", geracao: 11800, velocidade: 5.3 },
  { hora: "16:00", geracao: 14500, velocidade: 6.5 },
  { hora: "18:00", geracao: 17200, velocidade: 7.6 },
  { hora: "20:00", geracao: 19800, velocidade: 8.8 },
  { hora: "22:00", geracao: 20500, velocidade: 9.2 },
]

const monthlyWind = [
  { mes: "Jan", geracao: 3800, fatorCap: 38 },
  { mes: "Fev", geracao: 3500, fatorCap: 35 },
  { mes: "Mar", geracao: 3200, fatorCap: 32 },
  { mes: "Abr", geracao: 2800, fatorCap: 28 },
  { mes: "Mai", geracao: 2500, fatorCap: 25 },
  { mes: "Jun", geracao: 3200, fatorCap: 32 },
  { mes: "Jul", geracao: 4200, fatorCap: 42 },
  { mes: "Ago", geracao: 4800, fatorCap: 48 },
  { mes: "Set", geracao: 5200, fatorCap: 52 },
  { mes: "Out", geracao: 4900, fatorCap: 49 },
  { mes: "Nov", geracao: 4200, fatorCap: 42 },
  { mes: "Dez", geracao: 3900, fatorCap: 39 },
]

const windRose = [
  { direcao: "N", velocidade: 6.2 },
  { direcao: "NE", velocidade: 8.5 },
  { direcao: "E", velocidade: 9.8 },
  { direcao: "SE", velocidade: 8.2 },
  { direcao: "S", velocidade: 5.5 },
  { direcao: "SO", velocidade: 4.2 },
  { direcao: "O", velocidade: 3.8 },
  { direcao: "NO", velocidade: 4.5 },
]

const windFarms = [
  { id: 1, name: "Complexo Eolico Alto Sertao", state: "BA", turbines: 184, capacity: 386, generation: 312, windSpeed: 8.4, factorCap: 42, status: "online" },
  { id: 2, name: "Parque Eolico Ventos do Araripe", state: "PE", turbines: 156, capacity: 354, generation: 298, windSpeed: 7.8, factorCap: 38, status: "online" },
  { id: 3, name: "Complexo Eolico Lagoa dos Ventos", state: "PI", turbines: 230, capacity: 716, generation: 585, windSpeed: 9.2, factorCap: 45, status: "online" },
  { id: 4, name: "Parque Eolico Tucano", state: "BA", turbines: 120, capacity: 312, generation: 248, windSpeed: 7.5, factorCap: 36, status: "online" },
  { id: 5, name: "Complexo Eolico Chafariz", state: "PB", turbines: 136, capacity: 471, generation: 395, windSpeed: 8.8, factorCap: 41, status: "online" },
  { id: 6, name: "Parque Eolico Caetite", state: "BA", turbines: 92, capacity: 294, generation: 210, windSpeed: 6.8, factorCap: 33, status: "maintenance" },
  { id: 7, name: "Complexo Eolico Trairi", state: "CE", turbines: 108, capacity: 324, generation: 275, windSpeed: 8.1, factorCap: 39, status: "online" },
  { id: 8, name: "Parque Eolico Santa Luzia", state: "PB", turbines: 78, capacity: 234, generation: 198, windSpeed: 8.6, factorCap: 43, status: "online" },
]

const stateCapacity = [
  { estado: "BA", valor: 6800, cor: "#00b4d8" },
  { estado: "PI", valor: 4200, cor: "#facc15" },
  { estado: "RN", valor: 3800, cor: "#4ade80" },
  { estado: "CE", valor: 2900, cor: "#f97316" },
  { estado: "PB", valor: 2400, cor: "#3b82f6" },
  { estado: "PE", valor: 1800, cor: "#a855f7" },
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
              {typeof entry.value === "number" ? formatNumber(entry.value) : entry.value}
              {entry.dataKey === "velocidade" || entry.dataKey === "windSpeed" ? " m/s" : entry.dataKey === "fatorCap" ? "%" : " MW"}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function EolicaPage() {
  const totalCapacity = windFarms.reduce((s, f) => s + f.capacity, 0)
  const totalGeneration = windFarms.reduce((s, f) => s + f.generation, 0)
  const totalTurbines = windFarms.reduce((s, f) => s + f.turbines, 0)
  const avgFactor = Math.round(windFarms.reduce((s, f) => s + f.factorCap, 0) / windFarms.length)

  return (
    <DashboardLayout title="Usinas Eolicas" subtitle="Monitoramento da geracao eolica em tempo real">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Capacidade Instalada"
          value={(totalCapacity / 1000).toFixed(1)}
          unit="GW"
          trend="up"
          trendValue="+22.4%"
          icon={Wind}
          color="cyan"
          sparkline={[22, 25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58]}
        />
        <StatsCard
          title="Geracao Atual"
          value={formatNumber(totalGeneration)}
          unit="MW"
          trend="down"
          trendValue="-3.2%"
          icon={TrendingUp}
          color="green"
          sparkline={[55, 62, 58, 48, 52, 45, 38, 42, 48, 52, 58, 55]}
        />
        <StatsCard
          title="Aerogeradores"
          value={formatNumber(totalTurbines)}
          unit="turbinas"
          icon={Gauge}
          color="yellow"
          sparkline={[800, 850, 900, 920, 950, 980, 1000, 1020, 1050, 1080, 1100, 1104]}
        />
        <StatsCard
          title="Fator de Capacidade"
          value={`${avgFactor}`}
          unit="%"
          trend="up"
          trendValue="+2.1%"
          icon={MapPin}
          color="orange"
          sparkline={[32, 35, 30, 28, 25, 32, 38, 42, 45, 42, 38, 35]}
        />
      </div>

      {/* Hourly Generation + Wind Rose */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="lg:col-span-2">
          <GlassCardHeader>
            <GlassCardTitle>Geracao Eolica e Velocidade do Vento (24h)</GlassCardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00b4d8]" />
                <span className="text-xs text-[#8b9cb8]">Geracao (MW)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
                <span className="text-xs text-[#8b9cb8]">Vento (m/s)</span>
              </div>
            </div>
          </GlassCardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyWind} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hora" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis yAxisId="left" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="geracao" name="Geracao" stroke="#00b4d8" strokeWidth={2} fillOpacity={1} fill="url(#colorWind)" />
                <Line yAxisId="right" type="monotone" dataKey="velocidade" name="Velocidade" stroke="#4ade80" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Wind Rose */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Rosa dos Ventos</GlassCardTitle>
            <span className="text-xs text-[#8b9cb8]">Velocidade media (m/s)</span>
          </GlassCardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={windRose} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="direcao" tick={{ fill: '#8b9cb8', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: '#8b9cb8', fontSize: 10 }} stroke="#1e293b" />
                <Radar name="Velocidade" dataKey="velocidade" stroke="#00b4d8" fill="#00b4d8" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4 pt-4 border-t border-[#1e293b]">
            <p className="text-xs text-[#8b9cb8]">Direcao predominante</p>
            <p className="text-lg font-bold text-[#00b4d8]">Leste (E) - 9.8 m/s</p>
          </div>
        </GlassCard>
      </div>

      {/* Monthly + State Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Geracao Mensal e Fator de Capacidade</GlassCardTitle>
          </GlassCardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyWind} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="mes" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis yAxisId="left" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="geracao" name="Geracao" fill="#00b4d8" fillOpacity={0.7} radius={[4, 4, 0, 0]} barSize={20}>
                  {monthlyWind.map((entry, i) => (
                    <Cell key={i} fill="#00b4d8" fillOpacity={entry.geracao > 4500 ? 1 : 0.5} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="fatorCap" name="Fator Cap." stroke="#facc15" strokeWidth={2} dot={{ fill: '#facc15', r: 3 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Capacidade por Estado</GlassCardTitle>
          </GlassCardHeader>
          <div className="space-y-4 mt-2">
            {stateCapacity.map((s) => {
              const max = Math.max(...stateCapacity.map(x => x.valor))
              return (
                <div key={s.estado}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{s.estado}</span>
                    <span className="text-sm font-bold" style={{ color: s.cor }}>
                      {(s.valor / 1000).toFixed(1)} GW
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#1e293b]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(s.valor / max) * 100}%`, backgroundColor: s.cor, boxShadow: `0 0 8px ${s.cor}50` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between">
            <span className="text-sm text-[#8b9cb8]">Total Nacional Eolico</span>
            <span className="text-lg font-bold text-[#00b4d8]">
              {(stateCapacity.reduce((s, r) => s + r.valor, 0) / 1000).toFixed(1)} GW
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RealtimeGauge title="Geracao vs Capacidade" value={totalGeneration} maxValue={totalCapacity} unit="MW" color="#00b4d8" />
        <RealtimeGauge title="Vel. Media do Vento" value={8.4} maxValue={15} unit="m/s" color="#4ade80" />
        <RealtimeGauge title="Fator de Capacidade" value={avgFactor} maxValue={100} unit="%" color="#facc15" />
        <RealtimeGauge title="Disponibilidade" value={94} maxValue={100} unit="%" color="#f97316" />
      </div>

      {/* Wind Farms Table */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Parques Eolicos em Operacao</GlassCardTitle>
          <span className="text-xs text-[#8b9cb8]">{windFarms.length} parques monitorados</span>
        </GlassCardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Parque</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Turbinas</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Capacidade</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Geracao</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Vento</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Fator Cap.</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {windFarms.map((farm) => (
                <tr key={farm.id} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#00b4d8]/10">
                        <Wind className="w-4 h-4 text-[#00b4d8]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{farm.name}</p>
                        <p className="text-xs text-[#8b9cb8]">{farm.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-white">{farm.turbines}</td>
                  <td className="py-4 px-4 text-sm text-white">{farm.capacity} MW</td>
                  <td className="py-4 px-4 text-sm text-[#00b4d8] font-medium">{farm.generation} MW</td>
                  <td className="py-4 px-4 text-sm text-white">{farm.windSpeed} m/s</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-[#1e293b]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${farm.factorCap}%`,
                            backgroundColor: farm.factorCap >= 40 ? "#4ade80" : farm.factorCap >= 30 ? "#facc15" : "#f97316"
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#8b9cb8]">{farm.factorCap}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      farm.status === "online" ? "bg-[#4ade80]/20 text-[#4ade80]" : "bg-yellow-500/20 text-yellow-500"
                    )}>
                      {farm.status === "online" ? "Online" : "Manutencao"}
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
