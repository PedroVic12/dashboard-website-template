'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchDashboardData } from '@/controllers/dashboardController';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function toneToClasses(tone) {
  if (tone === 'bad') return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900';
  if (tone === 'neutral') return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
  return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900';
}

function barTone(tone) {
  const map = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    fuchsia: 'bg-fuchsia-500',
    cyan: 'bg-cyan-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };
  return map[tone] || 'bg-slate-500';
}

function statusTone(tone) {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900',
    amber: 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900',
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-200 dark:border-cyan-900',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-100 dark:bg-indigo-950/25 dark:text-indigo-200 dark:border-indigo-900',
  };
  return map[tone] || 'bg-slate-50 text-slate-800 border-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
}

function KpiCard({ title, value, delta, deltaTone }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        {title}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-2xl font-black tracking-tight">
          {value}
        </div>
        <div className={cx('text-xs font-bold px-2 py-1 rounded-lg border', toneToClasses(deltaTone))}>
          {delta}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="font-black">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SimpleBarChart({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.label}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200">{i.label}</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">{i.value}</span>
          </div>
          <div className="mt-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className={cx('h-full rounded-full', barTone(i.tone))}
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400">
          <tr>
            <th className="text-left p-2 text-xs font-black uppercase tracking-widest">Item</th>
            <th className="text-left p-2 text-xs font-black uppercase tracking-widest">Status</th>
            <th className="text-left p-2 text-xs font-black uppercase tracking-widest">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-slate-200 dark:border-slate-800">
              <td className="p-2 font-semibold">{r.name}</td>
              <td className="p-2">
                <span className={cx('text-xs font-bold px-2 py-1 rounded-lg border', statusTone(r.statusTone))}>
                  {r.status}
                </span>
              </td>
              <td className="p-2 text-slate-500 dark:text-slate-400">{r.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDashboardData()
      .then((d) => {
        if (!mounted) return;
        setData(d);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const kpis = data?.kpis || [];
  const throughput = data?.throughput || [];
  const recent = data?.recent || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Mobile-first • rotas reais • mock backend em /public/backend
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-slate-500 dark:text-slate-400">
          Loading...
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.title} title={k.title} value={k.value} delta={k.delta} deltaTone={k.deltaTone} />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Throughput" subtitle="Volume por área (exemplo)">
            <SimpleBarChart items={throughput} />
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <Panel title="Recent" subtitle="Últimas mudanças">
            <RecentTable rows={recent} />
          </Panel>
        </div>
      </div>

      <Panel
        title="Quality checklist"
        subtitle="Uma pitada de UI/UX pro max"
        right={<span className="text-xs text-slate-400">v1</span>}
      >
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="font-extrabold">Mobile first</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Espaçamento menor por padrão, grids sobem em breakpoints.
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="font-extrabold">Dark mode real</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Toggle + persistência em localStorage.
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="font-extrabold">Notifications</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dropdown + unread badge + Mark all read.
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="font-extrabold">Backend mock</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              `/public/backend/dashboard.json` consumido via `fetch`.
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
