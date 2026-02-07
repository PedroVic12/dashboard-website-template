"use client"

import { GlassCard, GlassCardHeader, GlassCardTitle } from "./GlassCard"
import { Sun, Wind, Droplets, Leaf, Atom, MoreVertical, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"

const powerPlants = [
  {
    id: 1,
    name: "Parque Solar Nova Olinda",
    type: "solar",
    state: "PI",
    capacity: 292,
    generation: 245,
    efficiency: 84,
    trend: "up",
    status: "online"
  },
  {
    id: 2,
    name: "Complexo Eólico Alto Sertão",
    type: "wind",
    state: "BA",
    capacity: 386,
    generation: 312,
    efficiency: 81,
    trend: "up",
    status: "online"
  },
  {
    id: 3,
    name: "UHE Belo Monte",
    type: "hydro",
    state: "PA",
    capacity: 11233,
    generation: 8450,
    efficiency: 75,
    trend: "down",
    status: "online"
  },
  {
    id: 4,
    name: "Parque Eólico Ventos do Araripe",
    type: "wind",
    state: "PE",
    capacity: 354,
    generation: 298,
    efficiency: 84,
    trend: "up",
    status: "online"
  },
  {
    id: 5,
    name: "Usina Solar Pirapora",
    type: "solar",
    state: "MG",
    capacity: 321,
    generation: 278,
    efficiency: 87,
    trend: "up",
    status: "online"
  },
  {
    id: 6,
    name: "UTE Biomassa Jalles",
    type: "biomass",
    state: "GO",
    capacity: 175,
    generation: 142,
    efficiency: 81,
    trend: "down",
    status: "maintenance"
  },
]

const typeConfig = {
  solar: { icon: Sun, color: "#facc15", label: "Solar" },
  wind: { icon: Wind, color: "#00b4d8", label: "Eólica" },
  hydro: { icon: Droplets, color: "#3b82f6", label: "Hidrelétrica" },
  biomass: { icon: Leaf, color: "#4ade80", label: "Biomassa" },
  nuclear: { icon: Atom, color: "#a855f7", label: "Nuclear" },
}

export function PowerPlantList() {
  return (
    <GlassCard className="col-span-2">
      <GlassCardHeader>
        <GlassCardTitle>Usinas em Operação</GlassCardTitle>
        <button className="text-[#8b9cb8] hover:text-white transition-colors text-sm">
          Ver todas →
        </button>
      </GlassCardHeader>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e293b]">
              <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Usina</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Tipo</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Capacidade</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Geração</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Eficiência</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-[#8b9cb8] uppercase tracking-wide">Status</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {powerPlants.map((plant) => {
              const config = typeConfig[plant.type]
              const Icon = config.icon
              
              return (
                <tr 
                  key={plant.id} 
                  className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{plant.name}</p>
                        <p className="text-xs text-[#8b9cb8]">{plant.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${config.color}20`,
                        color: config.color
                      }}
                    >
                      {config.label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-white">{formatNumber(plant.capacity)} MW</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{formatNumber(plant.generation)} MW</span>
                      {plant.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-[#4ade80]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[#f87171]" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-[#1e293b]">
                        <div
                          className="h-full rounded-full"
                          style={{ 
                            width: `${plant.efficiency}%`,
                            backgroundColor: plant.efficiency >= 80 ? "#4ade80" : plant.efficiency >= 60 ? "#facc15" : "#f87171"
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#8b9cb8]">{plant.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        plant.status === "online" 
                          ? "bg-[#4ade80]/20 text-[#4ade80]"
                          : "bg-yellow-500/20 text-yellow-500"
                      )}
                    >
                      {plant.status === "online" ? "Online" : "Manutenção"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-1 rounded hover:bg-[#1e293b] transition-colors">
                      <MoreVertical className="w-4 h-4 text-[#8b9cb8]" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
