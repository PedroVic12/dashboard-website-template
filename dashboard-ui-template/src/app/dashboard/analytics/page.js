export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight">Analytics</h1>
      <p className="text-slate-500 dark:text-slate-400">
        Esta rota existe de verdade: <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">/dashboard/analytics</code>
      </p>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="font-black">Ideias rápidas</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <div>- Cycle time, Lead time, Throughput</div>
          <div>- Alertas por SLA</div>
          <div>- Heatmap semanal</div>
        </div>
      </div>
    </div>
  );
}
