"use client"

import { useState } from "react"
import { DashboardLayout } from "@/widgets/DashboardLayout"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/widgets/GlassCard"
import {
  BarChart3, FileText, Download, Calendar, Filter, TrendingUp,
  TrendingDown, Zap, Wind, Sun, Droplets, FileSpreadsheet, FileDown,
  FilePlus, StickyNote, Save, X, Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area
} from "recharts"

const yearlyData = [
  { ano: "2019", hidro: 398, eolica: 55, solar: 6, termica: 85, biomassa: 32 },
  { ano: "2020", hidro: 396, eolica: 57, solar: 11, termica: 80, biomassa: 34 },
  { ano: "2021", hidro: 365, eolica: 72, solar: 16, termica: 102, biomassa: 38 },
  { ano: "2022", hidro: 410, eolica: 80, solar: 24, termica: 68, biomassa: 40 },
  { ano: "2023", hidro: 420, eolica: 95, solar: 35, termica: 55, biomassa: 42 },
  { ano: "2024", hidro: 425, eolica: 112, solar: 52, termica: 48, biomassa: 45 },
  { ano: "2025", hidro: 430, eolica: 128, solar: 68, termica: 42, biomassa: 48 },
]

const demandData = [
  { mes: "Jan", SE: 48500, S: 14200, NE: 12800, N: 6500, CO: 5800 },
  { mes: "Fev", SE: 50200, S: 14800, NE: 13200, N: 6800, CO: 6100 },
  { mes: "Mar", SE: 49800, S: 14500, NE: 13500, N: 7000, CO: 6000 },
  { mes: "Abr", SE: 46200, S: 13200, NE: 12500, N: 6200, CO: 5600 },
  { mes: "Mai", SE: 43500, S: 12800, NE: 11800, N: 5800, CO: 5200 },
  { mes: "Jun", SE: 42000, S: 13500, NE: 11200, N: 5500, CO: 5000 },
  { mes: "Jul", SE: 43800, S: 14000, NE: 11500, N: 5600, CO: 5100 },
  { mes: "Ago", SE: 45200, S: 13800, NE: 12000, N: 5900, CO: 5400 },
  { mes: "Set", SE: 47500, S: 14200, NE: 12800, N: 6200, CO: 5600 },
  { mes: "Out", SE: 49000, S: 14500, NE: 13200, N: 6500, CO: 5900 },
  { mes: "Nov", SE: 50500, S: 15000, NE: 13800, N: 6800, CO: 6200 },
  { mes: "Dez", SE: 51200, S: 15200, NE: 14000, N: 7000, CO: 6300 },
]

const reports = [
  { id: 1, title: "Relatorio Mensal do SIN - Janeiro 2026", type: "mensal", date: "05/02/2026", size: "4.2 MB", category: "Operacao" },
  { id: 2, title: "Boletim Diario de Operacao", type: "diario", date: "06/02/2026", size: "1.8 MB", category: "Operacao" },
  { id: 3, title: "Analise de Contingencia - Regiao Sudeste", type: "especial", date: "04/02/2026", size: "2.5 MB", category: "Seguranca" },
  { id: 4, title: "Balanco Energetico Semanal", type: "semanal", date: "03/02/2026", size: "3.1 MB", category: "Energia" },
  { id: 5, title: "Previsao de Carga - Fevereiro 2026", type: "mensal", date: "01/02/2026", size: "2.8 MB", category: "Planejamento" },
  { id: 6, title: "Relatorio de Geracao Renovavel", type: "mensal", date: "02/02/2026", size: "5.4 MB", category: "Renovavel" },
  { id: 7, title: "Situacao dos Reservatorios", type: "semanal", date: "06/02/2026", size: "1.2 MB", category: "Hidro" },
  { id: 8, title: "Indicadores de Desempenho do SIN", type: "mensal", date: "01/02/2026", size: "3.8 MB", category: "Operacao" },
]

const kpis = [
  { label: "Geracao Total 2025", value: "716 TWh", trend: "up", change: "+4.2%", icon: Zap, color: "#00b4d8" },
  { label: "Pico de Demanda", value: "102.2 GW", trend: "up", change: "+2.8%", icon: TrendingUp, color: "#f97316" },
  { label: "Participacao Renovavel", value: "88.4%", trend: "up", change: "+3.1%", icon: Sun, color: "#4ade80" },
  { label: "Nivel dos Reservatorios", value: "62.5%", trend: "down", change: "-5.4%", icon: Droplets, color: "#3b82f6" },
]

const exportOptions = [
  { label: "Excel (CSV)", formato: "csv", icon: FileSpreadsheet, dados: "energia", desc: "Dados de geracao em CSV" },
  { label: "Excel (CSV)", formato: "csv", icon: FileSpreadsheet, dados: "transmissao", desc: "Linhas de transmissao em CSV" },
  { label: "Excel (CSV)", formato: "csv", icon: FileSpreadsheet, dados: "solar", desc: "Usinas solares em CSV" },
  { label: "Excel (CSV)", formato: "csv", icon: FileSpreadsheet, dados: "eolica", desc: "Usinas eolicas em CSV" },
  { label: "JSON", formato: "json", icon: FileDown, dados: "energia", desc: "Dados de geracao em JSON" },
  { label: "Markdown", formato: "md", icon: FileText, dados: "energia", desc: "Relatorio de geracao em MD" },
  { label: "Markdown", formato: "md", icon: FileText, dados: "transmissao", desc: "Linhas de transmissao em MD" },
  { label: "Markdown", formato: "md", icon: FileText, dados: "relatorios", desc: "Lista de relatorios em MD" },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 border border-[#00b4d8]/30">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-[#8b9cb8]">{entry.name}:</span>
            <span className="text-white font-medium">{typeof entry.value === "number" ? formatNumber(entry.value) : entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function RelatoriosPage() {
  const [filterType, setFilterType] = useState("all")
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [notes, setNotes] = useState([])
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [exportStatus, setExportStatus] = useState(null)

  const filteredReports = filterType === "all"
    ? reports
    : reports.filter(r => r.type === filterType)

  const getTypeBadge = (type) => {
    const config = {
      diario: { label: "Diario", bg: "bg-[#00b4d8]/20", text: "text-[#00b4d8]" },
      semanal: { label: "Semanal", bg: "bg-[#4ade80]/20", text: "text-[#4ade80]" },
      mensal: { label: "Mensal", bg: "bg-[#facc15]/20", text: "text-[#facc15]" },
      especial: { label: "Especial", bg: "bg-[#f97316]/20", text: "text-[#f97316]" },
    }
    const c = config[type]
    return <span className={cn("px-2 py-1 rounded-full text-xs font-medium", c.bg, c.text)}>{c.label}</span>
  }

  const handleExport = async (formato, dados) => {
    setExportStatus(`Exportando ${dados} como ${formato}...`)
    try {
      const res = await fetch(`/api/export?formato=${formato}&dados=${dados}`)
      if (!res.ok) throw new Error("Erro na exportacao")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const ext = formato === "csv" ? "csv" : formato === "json" ? "json" : "md"
      a.download = `ons_${dados}_${Date.now()}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setExportStatus("Exportado com sucesso!")
      setTimeout(() => setExportStatus(null), 3000)
    } catch {
      setExportStatus("Erro ao exportar. Tente novamente.")
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return
    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: noteContent,
      createdAt: new Date().toLocaleString("pt-BR"),
    }
    setNotes(prev => [newNote, ...prev])
    setNoteTitle("")
    setNoteContent("")
  }

  const handleExportNoteAsMarkdown = (note) => {
    const md = `# ${note.title}\n\n> Criado em: ${note.createdAt}\n\n${note.content}\n`
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `anotacao_${note.id}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  return (
    <DashboardLayout title="Relatorios" subtitle="Analises, exportacoes e anotacoes do Sistema Interligado Nacional">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <GlassCard key={kpi.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">{kpi.label}</p>
                  <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1e293b]">
                {kpi.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-[#4ade80]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#f87171]" />
                )}
                <span className={cn("text-sm font-medium", kpi.trend === "up" ? "text-[#4ade80]" : "text-[#f87171]")}>
                  {kpi.change}
                </span>
                <span className="text-xs text-[#8b9cb8]">vs. ano anterior</span>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          onClick={() => { setShowExportPanel(!showExportPanel); setShowNotesPanel(false) }}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200",
            showExportPanel
              ? "bg-[#00b4d8] text-[#0a0f1c]"
              : "glass-card text-[#00b4d8] hover:bg-[#00b4d8]/20"
          )}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Dados
        </button>
        <button
          onClick={() => { setShowNotesPanel(!showNotesPanel); setShowExportPanel(false) }}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200",
            showNotesPanel
              ? "bg-[#4ade80] text-[#0a0f1c]"
              : "glass-card text-[#4ade80] hover:bg-[#4ade80]/20"
          )}
        >
          <StickyNote className="w-4 h-4" />
          Anotacoes ({notes.length})
        </button>
        {exportStatus && (
          <span className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            exportStatus.includes("sucesso") ? "bg-[#4ade80]/20 text-[#4ade80]" : exportStatus.includes("Erro") ? "bg-[#f87171]/20 text-[#f87171]" : "bg-[#00b4d8]/20 text-[#00b4d8]"
          )}>
            {exportStatus.includes("sucesso") ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4 animate-pulse" />}
            {exportStatus}
          </span>
        )}
      </div>

      {/* Export Panel */}
      {showExportPanel && (
        <GlassCard className="mb-8" glow>
          <GlassCardHeader>
            <GlassCardTitle>Exportar Dados do Sistema</GlassCardTitle>
            <button onClick={() => setShowExportPanel(false)} className="text-[#8b9cb8] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </GlassCardHeader>
          <p className="text-sm text-[#8b9cb8] mb-6">Selecione o formato e o tipo de dados para exportar. Os arquivos CSV podem ser abertos no Excel.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportOptions.map((opt, i) => {
              const OptIcon = opt.icon
              return (
                <button
                  key={i}
                  onClick={() => handleExport(opt.formato, opt.dados)}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#1e293b]/50 hover:bg-[#1e293b] border border-[#1e293b] hover:border-[#00b4d8]/30 transition-all duration-200 text-left group"
                >
                  <div className="p-2 rounded-lg bg-[#00b4d8]/10 group-hover:bg-[#00b4d8]/20 transition-colors flex-shrink-0">
                    <OptIcon className="w-5 h-5 text-[#00b4d8]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{opt.label}</p>
                    <p className="text-xs text-[#8b9cb8] mt-1">{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </GlassCard>
      )}

      {/* Notes Panel */}
      {showNotesPanel && (
        <GlassCard className="mb-8" glow>
          <GlassCardHeader>
            <GlassCardTitle>Anotacoes e Observacoes</GlassCardTitle>
            <button onClick={() => setShowNotesPanel(false)} className="text-[#8b9cb8] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </GlassCardHeader>

          {/* New Note Form */}
          <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-[#1e293b] mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FilePlus className="w-4 h-4 text-[#4ade80]" />
              <span className="text-sm font-medium text-white">Nova Anotacao</span>
            </div>
            <input
              type="text"
              placeholder="Titulo da anotacao..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#4ade80]/50 transition-colors mb-3"
            />
            <textarea
              placeholder="Escreva suas observacoes aqui... (suporta texto livre)"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#4ade80]/50 transition-colors resize-none mb-3"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveNote}
                disabled={!noteTitle.trim() || !noteContent.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4ade80] text-[#0a0f1c] font-medium text-sm hover:bg-[#4ade80]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Salvar Anotacao
              </button>
              <span className="text-xs text-[#8b9cb8]">Anotacoes podem ser exportadas como .md</span>
            </div>
          </div>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote className="w-10 h-10 text-[#8b9cb8]/40 mx-auto mb-3" />
              <p className="text-sm text-[#8b9cb8]">Nenhuma anotacao ainda. Crie sua primeira acima.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="flex items-start justify-between p-4 rounded-xl bg-[#1e293b]/30 hover:bg-[#1e293b]/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">{note.title}</p>
                      <span className="text-xs text-[#8b9cb8] flex-shrink-0">{note.createdAt}</span>
                    </div>
                    <p className="text-xs text-[#8b9cb8] line-clamp-2 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleExportNoteAsMarkdown(note)}
                      className="p-2 rounded-lg hover:bg-[#4ade80]/20 text-[#4ade80] transition-colors"
                      title="Exportar como .md"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 rounded-lg hover:bg-[#f87171]/20 text-[#f87171] transition-colors"
                      title="Excluir"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Evolucao da Geracao por Fonte (TWh)</GlassCardTitle>
          </GlassCardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="ano" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hidro" name="Hidraulica" stackId="a" fill="#3b82f6" />
                <Bar dataKey="eolica" name="Eolica" stackId="a" fill="#00b4d8" />
                <Bar dataKey="solar" name="Solar" stackId="a" fill="#facc15" />
                <Bar dataKey="termica" name="Termica" stackId="a" fill="#f97316" />
                <Bar dataKey="biomassa" name="Biomassa" stackId="a" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#1e293b]">
            {[
              { label: "Hidraulica", color: "#3b82f6" },
              { label: "Eolica", color: "#00b4d8" },
              { label: "Solar", color: "#facc15" },
              { label: "Termica", color: "#f97316" },
              { label: "Biomassa", color: "#4ade80" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[#8b9cb8]">{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Demanda Mensal por Regiao (MW med)</GlassCardTitle>
          </GlassCardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={demandData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="mes" stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                <YAxis stroke="#8b9cb8" tick={{ fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="SE" name="Sudeste" fill="#00b4d8" fillOpacity={0.2} stroke="#00b4d8" strokeWidth={2} />
                <Line type="monotone" dataKey="S" name="Sul" stroke="#4ade80" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="NE" name="Nordeste" stroke="#facc15" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="N" name="Norte" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="CO" name="Centro-Oeste" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#1e293b]">
            {[
              { label: "Sudeste", color: "#00b4d8" },
              { label: "Sul", color: "#4ade80" },
              { label: "Nordeste", color: "#facc15" },
              { label: "Norte", color: "#f97316" },
              { label: "Centro-Oeste", color: "#3b82f6" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[#8b9cb8]">{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Reports List */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-3">
            <GlassCardTitle>Relatorios Disponiveis</GlassCardTitle>
            <span className="text-xs text-[#8b9cb8] bg-[#1e293b] px-2 py-0.5 rounded-full">{filteredReports.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8b9cb8]" />
            {["all", "diario", "semanal", "mensal", "especial"].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                  filterType === f
                    ? "bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30"
                    : "text-[#8b9cb8] hover:bg-[#1e293b] border border-transparent"
                )}
              >
                {f === "all" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </GlassCardHeader>

        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 rounded-lg bg-[#1e293b]/30 hover:bg-[#1e293b]/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#00b4d8]/10">
                  <FileText className="w-5 h-5 text-[#00b4d8]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-[#00b4d8] transition-colors">
                    {report.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {getTypeBadge(report.type)}
                    <span className="text-xs text-[#8b9cb8]">{report.category}</span>
                    <span className="text-xs text-[#8b9cb8]">{report.date}</span>
                    <span className="text-xs text-[#8b9cb8]">{report.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport("csv", "relatorios")}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80]/20 transition-colors text-xs font-medium"
                  title="Exportar como CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">CSV</span>
                </button>
                <button
                  onClick={() => handleExport("md", "relatorios")}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#facc15]/10 text-[#facc15] hover:bg-[#facc15]/20 transition-colors text-xs font-medium"
                  title="Exportar como Markdown"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">MD</span>
                </button>
                <button
                  onClick={() => handleExport("json", "relatorios")}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#00b4d8]/10 text-[#00b4d8] hover:bg-[#00b4d8]/20 transition-colors text-xs font-medium"
                  title="Exportar como JSON"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">JSON</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </DashboardLayout>
  )
}
