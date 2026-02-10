// src/views/DashboardView.js

const DashboardView = ({ detailedActivities }) => {
    const total = detailedActivities.length;
    const done = detailedActivities.filter(t => (t.status||'').toLowerCase().includes('conclu')).length;
    const pending = total - done;
    const efficiency = total > 0 ? Math.round((done/total)*100) : 0;
    const uniqueResp = new Set(detailedActivities.map(a => a.responsavel).filter(Boolean)).size;

    return (
        <div className="space-y-6 fade-in pb-10">
            <h2 className="text-xl font-bold text-slate-800">Dashboard: Atividades SP MUST</h2>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total</p><p className="text-2xl font-bold text-slate-800 mt-1">{total}</p></div><div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Icons.Layout/></div></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resp.</p><p className="text-2xl font-bold text-indigo-600 mt-1">{uniqueResp}</p></div><div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Icons.Users/></div></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pendentes</p><p className="text-2xl font-bold text-amber-500 mt-1">{pending}</p></div><div className="bg-amber-50 p-2 rounded-lg text-amber-500"><Icons.AlertCircle/></div></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Eficiência</p><p className="text-2xl font-bold text-emerald-600 mt-1">{efficiency}%</p></div><div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><Icons.BarChart/></div></div>
            </div>
            
            <DashboardExtension />

            {/* Gráficos gerados pela Factory */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GenericChart data={detailedActivities} xKey="status" yKey="status" type="pie_status" title="Status Geral" />
                <GenericChart data={detailedActivities} xKey="obs" yKey="" type="pie_boolean" title="Atividades c/ Ressalva" />
                <GenericChart data={detailedActivities} xKey="responsavel" yKey="status" type="stacked_bar_volume" title="Atividades por Responsável" />
            </div>
        </div>
    );
};
