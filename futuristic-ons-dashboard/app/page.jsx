"use client"

import { DashboardLayout } from "@/widgets/DashboardLayout"
import { StatsCard } from "@/widgets/StatsCard"
import { EnergyChart } from "@/widgets/EnergyChart"
import { RenewableChart } from "@/widgets/RenewableChart"
import { RealtimeGauge } from "@/widgets/RealtimeGauge"
import { TransmissionMap } from "@/widgets/TransmissionMap"
import { AlertsPanel } from "@/widgets/AlertsPanel"
import { PowerPlantList } from "@/widgets/PowerPlantList"
import { Zap, Activity, Sun, Wind } from "lucide-react"

export default function OverviewPage() {
  return (
    <DashboardLayout title="Visao Geral do SIN">
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
          title="Consumo Atual"
          value="74.892"
          unit="MW"
          trend="up"
          trendValue="+1.8%"
          icon={Activity}
          color="orange"
          sparkline={[42, 48, 52, 58, 62, 65, 68, 72, 75, 78, 74, 76]}
        />
        <StatsCard
          title="Energia Solar"
          value="28.543"
          unit="MW"
          trend="up"
          trendValue="+12.5%"
          icon={Sun}
          color="yellow"
          sparkline={[0, 5, 15, 28, 42, 58, 68, 62, 48, 25, 8, 0]}
        />
        <StatsCard
          title="Energia Eolica"
          value="22.847"
          unit="MW"
          trend="down"
          trendValue="-3.2%"
          icon={Wind}
          color="green"
          sparkline={[55, 62, 58, 48, 52, 45, 38, 42, 48, 52, 58, 55]}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <EnergyChart />
        <RenewableChart />
      </div>

      {/* Gauges Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RealtimeGauge 
          title="Carga do Sistema" 
          value={74892} 
          maxValue={100000} 
          unit="MW"
          color="#00b4d8"
        />
        <RealtimeGauge 
          title="Reserva Operativa" 
          value={8500} 
          maxValue={15000} 
          unit="MW"
          color="#4ade80"
        />
        <RealtimeGauge 
          title="Freq. do Sistema" 
          value={60} 
          maxValue={62} 
          unit="Hz"
          color="#facc15"
        />
        <RealtimeGauge 
          title="Fator de Carga" 
          value={87} 
          maxValue={100} 
          unit="%"
          color="#f97316"
        />
      </div>

      {/* Map and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TransmissionMap />
        <AlertsPanel />
      </div>

      {/* Power Plants Table */}
      <PowerPlantList />
    </DashboardLayout>
  )
}
