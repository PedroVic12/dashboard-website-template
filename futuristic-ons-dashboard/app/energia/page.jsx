"use client"

import { DashboardLayout } from "@/widgets/DashboardLayout"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/widgets/GlassCard"
import { StatsCard } from "@/widgets/StatsCard"
import { RealtimeGauge } from "@/widgets/RealtimeGauge"
import { Zap, Activity, TrendingUp, Battery, BatteryCharging, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { formatNumber } from "@/lib/format"

const hourlyData = [
  { hora: "00:00", geracao: 52000, consumo: 48000, hidro: 35000, termica: 8000, renovavel: 9000 },
  { hora: "02:00", geracao: 48000, consumo: 42000, hidro: 33000, termica: 7500, renovavel: 7500 },
  { hora: "04:00", geracao: 45000, consumo: 40000, hidro: 32000, termica: 7000, renovavel: 6000 },
  { hora: "06:00", geracao: 52000, consumo: 48000, hidro: 34000, termica: 7000, renovavel: 11000 },
  { hora: "08:00", geracao: 62000, consumo: 58000, hidro: 36000, termica: 6500, renovavel: 19500 },
  { hora: "10:00", geracao: 72000, consumo: 68000, hidro: 38000, termica: 5000, renovavel: 29000 },
  { hora: "12:00", geracao: 78000, consumo: 74000, hidro: 39000, termica: 4500, renovavel: 34500 },
  { hora: "14:00", geracao: 76000, consumo: 72000, hidro: 38500, termica: 5000, renovavel: 32500 },
  { hora: "16:00", geracao: 70000, consumo: 66000, hidro: 37000, termica: 6000, renovavel: 27000 },
  { hora: "18:00", geracao: 74000, consumo: 78000, hidro: 40000, termica: 8500, renovavel: 25500 },
  { hora: "20:00", geracao: 72000, consumo: 76000, hidro: 42000, termica: 10000, renovavel: 20000 },
  { hora: "22:00", geracao: 58000, consumo: 54000, hidro: 36000, termica: 8500, renovavel: 13500 },
]

const weeklyData = [
  { dia: "Seg", demanda: 76000, geracao: 78000 },
  { dia: "Ter", demanda: 78500, geracao: 80000 },
  { dia: "Qua", demanda: 74000, geracao: 76500 },
  { dia: "Qui", demanda: 79000, geracao: 81000 },
  { dia: "Sex", demanda: 77000, geracao: 79500 },
  { dia: "Sab", demanda: 62000, geracao: 64000 },
  { dia: "Dom", demanda: 55000, geracao: 57000 },
]

const regionData = [
  { regiao: "Sudeste", valor: 45200, cor: "#00b4d8" },
  { regiao: "Sul", valor: 15700, cor: "#4ade80" },
  { regiao: "Nordeste", valor: 18300, cor: "#facc15" },
  { regiao: "Norte", valor: 12500, cor: "#f97316" },
  { regiao: "Centro-Oeste", valor: 9800, cor: "#3b82f6" },
]

const pieData = [
  { name: "Hidraulica", value: 62, fill: "#3b82f6" },
  { name: "Solar", value: 14, fill: "#facc15" },
  { name: "Eolica", value: 12, fill: "#00b4d8" },
  { name: "Termica", value: 8, fill: "#f97316" },
  { name: "Biomassa", value: 3, fill: "#4ade80" },
  { name: "Nuclear", value: 1, fill: "#a855f7" },
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

export default function EnergiaPage() {
  return (
    <DashboardLayout title="Energia Eletrica" subtitle="Monitoramento em tempo real da geracao e consumo">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Geracao Total"
          value="78.456"
          unit="MW"
          trend="up"
          trendValue="+2.4%"
          icon={Zap}
          color="cyan"
          sparkline={[45, 52, 48, 61, 55, 67, 72, 68, 74, 78, 82, 76]}
        />
        <StatsCard
          title="Consumo Nacional"
          value="74.892"
          unit="MW"
          trend="up"
          trendValue="+1.8%"
          icon={Activity}
          color="orange"
          sparkline={[42, 48, 52, 58, 62, 65, 68, 72, 75, 78, 74, 76]}
        />
        <StatsCard
          title="Superavit"
          value="3.564"
          unit="MW"
          trend="up"
          trendValue="+8.2%"
          icon={BatteryCharging}
          color="green"
          sparkline={[3, 10, 8, 3, -7, -1, 4, -4, 4, -4, 6, 3]}
        />
        <StatsCard
          title="Pico Diario"
          value="81.230"
          unit="MW"
          trend="up"
          trendValue="+0.5%"
          icon={TrendingUp}
          color="yellow"
          sparkline={[78, 79, 80, 79, 81, 80, 82, 81, 80, 81, 82, 81]}
        />
      </div>

      {/* Main Chart - Generation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="lg:col-span-2">
          <GlassCardHeader>
            <GlassCardTitle>Composicao da Geracao por Fonte (24h)</GlassCardTitle>
          </GlassCardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHidro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTermica" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRenov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hora" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="hidro" name="Hidraulica" stackId="1" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHidro)" />
                <Area type="monotone" dataKey="termica" name="Termica" stackId="1" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTermica)" />
                <Area type="monotone" dataKey="renovavel" name="Renovavel" stackId="1" stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#colorRenov)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pie Chart - Matrix */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Matriz Energetica Atual</GlassCardTitle>
          </GlassCardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-card rounded-lg p-2 border border-[#00b4d8]/30">
                          <p className="text-xs text-white">{payload[0].name}: <span className="font-bold">{payload[0].value}%</span></p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="text-xs text-[#8b9cb8]">{item.name}</span>
                <span className="text-xs font-bold ml-auto" style={{ color: item.fill }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Weekly Demand + Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Demanda vs Geracao Semanal</GlassCardTitle>
          </GlassCardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dia" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="demanda" name="Demanda" fill="#f97316" fillOpacity={0.7} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="geracao" name="Geracao" fill="#00b4d8" fillOpacity={0.7} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Regional Distribution */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Consumo por Regiao</GlassCardTitle>
          </GlassCardHeader>
          <div className="space-y-4 mt-2">
            {regionData.map((region) => {
              const max = Math.max(...regionData.map(r => r.valor))
              const pct = (region.valor / max) * 100
              return (
                <div key={region.regiao}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{region.regiao}</span>
                    <span className="text-sm font-bold" style={{ color: region.cor }}>
                      {(region.valor / 1000).toFixed(1)} GW
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#1e293b]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: region.cor, boxShadow: `0 0 8px ${region.cor}50` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between">
            <span className="text-sm text-[#8b9cb8]">Total Nacional</span>
            <span className="text-lg font-bold text-[#00b4d8]">
              {(regionData.reduce((s, r) => s + r.valor, 0) / 1000).toFixed(1)} GW
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealtimeGauge title="Carga do Sistema" value={74892} maxValue={100000} unit="MW" color="#00b4d8" />
        <RealtimeGauge title="Reserva Operativa" value={8500} maxValue={15000} unit="MW" color="#4ade80" />
        <RealtimeGauge title="Frequencia" value={60} maxValue={62} unit="Hz" color="#facc15" />
        <RealtimeGauge title="Fator de Carga" value={87} maxValue={100} unit="%" color="#f97316" />
      </div>
    </DashboardLayout>
  )
}
