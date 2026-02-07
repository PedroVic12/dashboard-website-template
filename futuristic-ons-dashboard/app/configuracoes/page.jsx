"use client"

import { useState } from "react"
import { DashboardLayout } from "@/widgets/DashboardLayout"
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/widgets/GlassCard"
import {
  Database, Server, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Settings, Shield, Globe, Clock, HardDrive, Wifi, WifiOff,
  ChevronRight, Save, RotateCcw, Play, Pause, Zap, Eye, EyeOff,
  Link2, Unlink
} from "lucide-react"
import { cn } from "@/lib/utils"

const initialDbConfig = {
  host: "localhost",
  port: "3306",
  database: "ons_dashboard",
  username: "ons_admin",
  password: "",
  tipo: "sqlite",
  caminho: "./data/ons.db",
  poolSize: "10",
  timeout: "30",
}

const apiEndpoints = [
  { name: "Energia Eletrica", path: "/api/energia", method: "GET", status: "online", latency: "12ms" },
  { name: "Transmissao", path: "/api/transmissao", method: "GET", status: "online", latency: "8ms" },
  { name: "Usinas", path: "/api/usinas", method: "GET", status: "online", latency: "15ms" },
  { name: "Relatorios", path: "/api/relatorios", method: "GET/POST", status: "online", latency: "10ms" },
  { name: "Exportacao", path: "/api/export", method: "GET", status: "online", latency: "22ms" },
]

const dataSourceOptions = [
  { id: "mock", label: "Dados Mock (Memoria)", desc: "Dados simulados carregados em memoria. Ideal para desenvolvimento e testes.", icon: HardDrive, status: "ativo" },
  { id: "sqlite", label: "SQLite Local", desc: "Banco de dados SQLite local. Requer better-sqlite3 instalado.", icon: Database, status: "disponivel" },
  { id: "api_externa", label: "API Externa ONS", desc: "Consume dados diretamente da API publica do ONS. Requer conexao com internet.", icon: Globe, status: "disponivel" },
]

const syncSchedules = [
  { id: "realtime", label: "Tempo Real", desc: "Atualiza a cada 5 segundos" },
  { id: "1min", label: "1 Minuto", desc: "Atualiza a cada 60 segundos" },
  { id: "5min", label: "5 Minutos", desc: "Atualiza a cada 5 minutos" },
  { id: "15min", label: "15 Minutos", desc: "Intervalo padrao do ONS" },
  { id: "1hora", label: "1 Hora", desc: "Atualiza a cada hora" },
  { id: "manual", label: "Manual", desc: "Apenas ao clicar em sincronizar" },
]

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("dados")
  const [dbConfig, setDbConfig] = useState(initialDbConfig)
  const [dataSource, setDataSource] = useState("mock")
  const [syncSchedule, setSyncSchedule] = useState("15min")
  const [showPassword, setShowPassword] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [isTesting, setIsTesting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [savedMessage, setSavedMessage] = useState(null)

  const tabs = [
    { id: "dados", label: "Fonte de Dados", icon: Database },
    { id: "api", label: "API Endpoints", icon: Server },
    { id: "sync", label: "Sincronizacao", icon: RefreshCw },
    { id: "banco", label: "Banco de Dados", icon: HardDrive },
  ]

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    // Simula teste de conexao
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (dataSource === "mock") {
      setTestResult({ success: true, message: "Dados mock carregados com sucesso. 5 repositorios ativos." })
    } else if (dataSource === "sqlite") {
      if (dbConfig.caminho) {
        setTestResult({ success: true, message: `Conexao com SQLite em ${dbConfig.caminho} simulada. Para uso real, instale better-sqlite3.` })
      } else {
        setTestResult({ success: false, message: "Caminho do banco SQLite nao configurado." })
      }
    } else {
      setTestResult({ success: true, message: "Conexao com API externa simulada. Configure a URL base para uso real." })
    }
    setIsTesting(false)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsSyncing(false)
    setSavedMessage("Dados sincronizados com sucesso!")
    setTimeout(() => setSavedMessage(null), 4000)
  }

  const handleSave = () => {
    setSavedMessage("Configuracoes salvas com sucesso!")
    setTimeout(() => setSavedMessage(null), 4000)
  }

  const handleTestEndpoint = async (path) => {
    try {
      const res = await fetch(path)
      if (res.ok) {
        const data = await res.json()
        alert(`Endpoint ${path} respondeu com sucesso!\n\n${JSON.stringify(data).slice(0, 300)}...`)
      }
    } catch {
      alert(`Erro ao testar endpoint ${path}`)
    }
  }

  return (
    <DashboardLayout title="Configuracoes" subtitle="Configuracao de fontes de dados, APIs e sincronizacao">

      {/* Success Banner */}
      {savedMessage && (
        <div className="flex items-center gap-3 px-5 py-3 mb-6 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30">
          <CheckCircle2 className="w-5 h-5 text-[#4ade80] flex-shrink-0" />
          <span className="text-sm font-medium text-[#4ade80]">{savedMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30"
                  : "glass-card text-[#8b9cb8] hover:text-white hover:bg-[#1e293b]"
              )}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Fonte de Dados */}
      {activeTab === "dados" && (
        <div className="space-y-6">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Selecionar Fonte de Dados</GlassCardTitle>
            </GlassCardHeader>
            <p className="text-sm text-[#8b9cb8] mb-6">
              Escolha de onde o dashboard ira consumir os dados. A arquitetura de repositorios permite trocar a fonte sem alterar a interface.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dataSourceOptions.map(opt => {
                const OptIcon = opt.icon
                const isActive = dataSource === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setDataSource(opt.id)}
                    className={cn(
                      "flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-200 text-left",
                      isActive
                        ? "border-[#00b4d8] bg-[#00b4d8]/10"
                        : "border-[#1e293b] bg-[#1e293b]/30 hover:border-[#00b4d8]/30 hover:bg-[#1e293b]/50"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("p-2 rounded-lg", isActive ? "bg-[#00b4d8]/20" : "bg-[#1e293b]")}>
                        <OptIcon className={cn("w-5 h-5", isActive ? "text-[#00b4d8]" : "text-[#8b9cb8]")} />
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", isActive ? "text-white" : "text-[#8b9cb8]")}>{opt.label}</p>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          opt.status === "ativo" ? "bg-[#4ade80]/20 text-[#4ade80]" : "bg-[#1e293b] text-[#8b9cb8]"
                        )}>
                          {opt.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b9cb8] leading-relaxed">{opt.desc}</p>
                    {isActive && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-[#00b4d8] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selecionado
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </GlassCard>

          {/* Test Connection */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Testar Conexao</GlassCardTitle>
            </GlassCardHeader>
            <div className="flex items-center gap-4">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200",
                  isTesting
                    ? "bg-[#1e293b] text-[#8b9cb8] cursor-wait"
                    : "bg-[#00b4d8] text-[#0a0f1c] hover:bg-[#00b4d8]/90"
                )}
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isTesting ? "Testando..." : "Testar Conexao"}
              </button>
              {testResult && (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
                  testResult.success ? "bg-[#4ade80]/10 text-[#4ade80]" : "bg-[#f87171]/10 text-[#f87171]"
                )}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Architecture Info */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Arquitetura de Repositorios</GlassCardTitle>
            </GlassCardHeader>
            <div className="space-y-3">
              {[
                { name: "BaseRepository", desc: "Classe base abstrata com findAll(), findById(), getSummary()", file: "lib/repositories/BaseRepository.js" },
                { name: "EnergiaRepository", desc: "Dados de geracao, matriz energetica, demanda e consumo regional", file: "lib/repositories/EnergiaRepository.js" },
                { name: "TransmissaoRepository", desc: "Linhas de transmissao e intercambios entre subsistemas", file: "lib/repositories/TransmissaoRepository.js" },
                { name: "UsinasRepository", desc: "Usinas solares e eolicas com dados de geracao", file: "lib/repositories/UsinasRepository.js" },
                { name: "RelatoriosRepository", desc: "Relatorios, KPIs e anotacoes do sistema", file: "lib/repositories/RelatoriosRepository.js" },
              ].map(repo => (
                <div key={repo.name} className="flex items-start gap-4 p-4 rounded-xl bg-[#1e293b]/30">
                  <div className="p-2 rounded-lg bg-[#00b4d8]/10 flex-shrink-0 mt-0.5">
                    <Database className="w-4 h-4 text-[#00b4d8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{repo.name}</p>
                      <ChevronRight className="w-3 h-3 text-[#8b9cb8]" />
                      <code className="text-xs text-[#00b4d8] bg-[#00b4d8]/10 px-2 py-0.5 rounded">{repo.file}</code>
                    </div>
                    <p className="text-xs text-[#8b9cb8]">{repo.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-[#facc15]/5 border border-[#facc15]/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#facc15] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#facc15] mb-1">Para migrar para SQLite</p>
                  <p className="text-xs text-[#8b9cb8] leading-relaxed">
                    1. Instale better-sqlite3: <code className="text-[#00b4d8]">npm install better-sqlite3</code><br />
                    2. Crie o arquivo de conexao em <code className="text-[#00b4d8]">lib/db.js</code><br />
                    3. Substitua os dados mock nos repositorios por queries SQL reais<br />
                    4. As API Routes e os componentes continuam funcionando sem alteracao
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab: API Endpoints */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Endpoints Disponiveis</GlassCardTitle>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#4ade80]" />
                <span className="text-xs text-[#4ade80] font-medium">Todos Online</span>
              </div>
            </GlassCardHeader>
            <div className="space-y-3">
              {apiEndpoints.map(ep => (
                <div key={ep.path} className="flex items-center justify-between p-4 rounded-xl bg-[#1e293b]/30 hover:bg-[#1e293b]/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-ping opacity-30" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-white">{ep.name}</p>
                        <code className="text-xs text-[#00b4d8] bg-[#00b4d8]/10 px-2 py-0.5 rounded">{ep.method}</code>
                      </div>
                      <code className="text-xs text-[#8b9cb8] mt-1">{ep.path}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#8b9cb8]">{ep.latency}</span>
                    <button
                      onClick={() => handleTestEndpoint(ep.path)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00b4d8]/10 text-[#00b4d8] hover:bg-[#00b4d8]/20 transition-colors text-xs font-medium opacity-0 group-hover:opacity-100"
                    >
                      <Play className="w-3 h-3" />
                      Testar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Documentacao dos Endpoints</GlassCardTitle>
            </GlassCardHeader>
            <div className="space-y-4 text-sm">
              {[
                { path: "GET /api/energia?tipo=geracao|matriz|demanda|consumo|summary", desc: "Retorna dados de energia eletrica filtrados por tipo" },
                { path: "GET /api/transmissao?tipo=linhas|intercambios|summary&status=...&regiao=...", desc: "Dados de linhas de transmissao com filtros" },
                { path: "GET /api/usinas?fonte=solar|eolica&tipo=lista|geracao|summary", desc: "Dados de usinas solares e eolicas" },
                { path: "GET /api/relatorios?tipo=lista|kpis|anotacoes|summary&filter=...", desc: "Lista de relatorios e KPIs" },
                { path: "POST /api/relatorios {action: 'anotacao', title, content}", desc: "Cria nova anotacao" },
                { path: "GET /api/export?formato=csv|json|md&dados=energia|transmissao|solar|eolica|relatorios", desc: "Exporta dados em diferentes formatos" },
              ].map(doc => (
                <div key={doc.path} className="p-3 rounded-lg bg-[#1e293b]/30">
                  <code className="text-xs text-[#00b4d8] block mb-1">{doc.path}</code>
                  <p className="text-xs text-[#8b9cb8]">{doc.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab: Sincronizacao */}
      {activeTab === "sync" && (
        <div className="space-y-6">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Intervalo de Sincronizacao</GlassCardTitle>
            </GlassCardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {syncSchedules.map(sched => (
                <button
                  key={sched.id}
                  onClick={() => setSyncSchedule(sched.id)}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 text-center",
                    syncSchedule === sched.id
                      ? "border-[#00b4d8] bg-[#00b4d8]/10"
                      : "border-[#1e293b] bg-[#1e293b]/30 hover:border-[#00b4d8]/30"
                  )}
                >
                  <Clock className={cn("w-5 h-5 mb-2", syncSchedule === sched.id ? "text-[#00b4d8]" : "text-[#8b9cb8]")} />
                  <p className={cn("text-sm font-medium", syncSchedule === sched.id ? "text-white" : "text-[#8b9cb8]")}>
                    {sched.label}
                  </p>
                  <p className="text-xs text-[#8b9cb8] mt-1">{sched.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#1e293b]/30">
              <div className="flex items-center gap-3">
                <RefreshCw className={cn("w-5 h-5", autoSync ? "text-[#4ade80]" : "text-[#8b9cb8]")} />
                <div>
                  <p className="text-sm font-medium text-white">Sincronizacao Automatica</p>
                  <p className="text-xs text-[#8b9cb8]">Atualiza os dados automaticamente de acordo com o intervalo selecionado</p>
                </div>
              </div>
              <button
                onClick={() => setAutoSync(!autoSync)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-200",
                  autoSync ? "bg-[#4ade80]" : "bg-[#1e293b]"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200",
                  autoSync ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Sincronizar Agora</GlassCardTitle>
            </GlassCardHeader>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200",
                  isSyncing
                    ? "bg-[#1e293b] text-[#8b9cb8] cursor-wait"
                    : "bg-[#4ade80] text-[#0a0f1c] hover:bg-[#4ade80]/90"
                )}
              >
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                {isSyncing ? "Sincronizando..." : "Sincronizar Dados"}
              </button>
              <span className="text-xs text-[#8b9cb8]">Ultima sincronizacao: agora</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab: Banco de Dados */}
      {activeTab === "banco" && (
        <div className="space-y-6">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Configuracao do Banco de Dados</GlassCardTitle>
            </GlassCardHeader>
            <p className="text-sm text-[#8b9cb8] mb-6">
              Configure a conexao com o banco de dados SQLite. Estas configuracoes serao usadas quando a fonte de dados for alterada para SQLite.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Tipo do Banco</label>
                <select
                  value={dbConfig.tipo}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b4d8]/50 transition-colors appearance-none"
                >
                  <option value="sqlite">SQLite (Local)</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                </select>
              </div>

              {dbConfig.tipo === "sqlite" ? (
                <div>
                  <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Caminho do Arquivo</label>
                  <input
                    type="text"
                    value={dbConfig.caminho}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, caminho: e.target.value }))}
                    placeholder="./data/ons.db"
                    className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Host</label>
                    <input
                      type="text"
                      value={dbConfig.host}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                      className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Porta</label>
                    <input
                      type="text"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, port: e.target.value }))}
                      className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Nome do Banco</label>
                    <input
                      type="text"
                      value={dbConfig.database}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, database: e.target.value }))}
                      className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Usuario</label>
                    <input
                      type="text"
                      value={dbConfig.username}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={dbConfig.password}
                        onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Digite a senha"
                        className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9cb8] hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Pool Size</label>
                <input
                  type="number"
                  value={dbConfig.poolSize}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, poolSize: e.target.value }))}
                  className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b9cb8] uppercase tracking-wide mb-2">Timeout (s)</label>
                <input
                  type="number"
                  value={dbConfig.timeout}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, timeout: e.target.value }))}
                  className="w-full bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b9cb8] focus:outline-none focus:border-[#00b4d8]/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#1e293b]">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00b4d8] text-[#0a0f1c] font-medium text-sm hover:bg-[#00b4d8]/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Configuracoes
              </button>
              <button
                onClick={() => setDbConfig(initialDbConfig)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card text-[#8b9cb8] hover:text-white font-medium text-sm transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Padrao
              </button>
            </div>
          </GlassCard>

          {/* SQL Schema Preview */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Schema SQL Sugerido</GlassCardTitle>
            </GlassCardHeader>
            <p className="text-sm text-[#8b9cb8] mb-4">
              Use este schema para criar as tabelas no SQLite quando migrar de dados mock para banco real.
            </p>
            <pre className="p-4 rounded-xl bg-[#0a0f1c] border border-[#1e293b] text-xs text-[#8b9cb8] overflow-x-auto leading-relaxed">
{`CREATE TABLE energia_geracao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hora TEXT NOT NULL,
  hidro REAL, eolica REAL, solar REAL,
  termica REAL, biomassa REAL,
  data_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE linhas_transmissao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL, tensao TEXT,
  extensao REAL, capacidade REAL,
  status TEXT, regiao TEXT, perdas REAL
);

CREATE TABLE usinas_solares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL, estado TEXT,
  capacidade REAL, geracao REAL,
  irradiancia REAL, status TEXT,
  fator_capacidade REAL
);

CREATE TABLE usinas_eolicas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL, estado TEXT,
  capacidade REAL, geracao REAL,
  turbinas INTEGER, velocidade_vento REAL,
  status TEXT, fator_capacidade REAL
);

CREATE TABLE relatorios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, type TEXT,
  date TEXT, size TEXT, category TEXT
);

CREATE TABLE anotacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`}
            </pre>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  )
}
