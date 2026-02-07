"use client"

import { GlassCard, GlassCardHeader, GlassCardTitle } from "./GlassCard"
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

const alerts = [
  {
    id: 1,
    type: "critical",
    title: "Sobrecarga na Linha Norte-CO",
    message: "Capacidade em 92% - Ação imediata necessária",
    time: "2 min atrás",
    region: "Norte"
  },
  {
    id: 2,
    type: "warning",
    title: "Alta Demanda Prevista",
    message: "Pico esperado às 19h - Região Sudeste",
    time: "15 min atrás",
    region: "Sudeste"
  },
  {
    id: 3,
    type: "info",
    title: "Manutenção Programada",
    message: "UTE Biomassa Jalles - Retorno em 4h",
    time: "1h atrás",
    region: "Centro-Oeste"
  },
  {
    id: 4,
    type: "success",
    title: "Usina Solar Reconectada",
    message: "Parque Solar Nova Olinda operando normalmente",
    time: "2h atrás",
    region: "Nordeste"
  },
]

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    iconColor: "text-red-500",
    dotColor: "bg-red-500"
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-500",
    dotColor: "bg-yellow-500"
  },
  info: {
    icon: Info,
    bgColor: "bg-[#00b4d8]/10",
    borderColor: "border-[#00b4d8]/30",
    iconColor: "text-[#00b4d8]",
    dotColor: "bg-[#00b4d8]"
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-[#4ade80]/10",
    borderColor: "border-[#4ade80]/30",
    iconColor: "text-[#4ade80]",
    dotColor: "bg-[#4ade80]"
  }
}

export function AlertsPanel() {
  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <GlassCardTitle>Alertas do Sistema</GlassCardTitle>
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-xs font-medium">
            {alerts.filter(a => a.type === "critical").length}
          </span>
        </div>
        <button className="text-xs text-[#00b4d8] hover:text-white transition-colors">
          Ver todos
        </button>
      </GlassCardHeader>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type]
          const Icon = config.icon

          return (
            <div
              key={alert.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02]",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", config.bgColor)}>
                  <Icon className={cn("w-4 h-4", config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {alert.title}
                    </h4>
                    <span className={cn("w-2 h-2 rounded-full animate-pulse", config.dotColor)} />
                  </div>
                  <p className="text-xs text-[#8b9cb8] mb-2">{alert.message}</p>
                  <div className="flex items-center gap-3 text-xs text-[#8b9cb8]">
                    <span>{alert.time}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-[#8b9cb8]">
                      {alert.region}
                    </span>
                  </div>
                </div>
                <button className="p-1 rounded hover:bg-[#1e293b] transition-colors">
                  <X className="w-4 h-4 text-[#8b9cb8]" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
