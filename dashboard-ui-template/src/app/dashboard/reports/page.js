'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { loadTasksFromStorage, fetchInitialTasks } from '@/controllers/tasksController';
import { loadCustomersFromStorage, fetchInitialCustomers } from '@/controllers/customersController';

function csvEscape(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export default function ReportsPage() {
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const t = loadTasksFromStorage();
    const c = loadCustomersFromStorage();

    if (t) setTasks(t);
    else fetchInitialTasks().then(setTasks);

    if (c) setCustomers(c);
    else fetchInitialCustomers().then(setCustomers);
  }, []);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const todo = tasks.filter((t) => t.status === 'todo' && !t.done).length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress' && !t.done).length;
    return { total, done, todo, inProgress };
  }, [tasks]);

  const downloadCSV = () => {
    const header = ['id', 'title', 'status', 'priority', 'assignee', 'due', 'done'];
    const lines = [header.join(',')].concat(
      tasks.map((t) => header.map((k) => csvEscape(t[k])).join(','))
    );

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Reports</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Relatórios simples para SaaS: estatísticas + export.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Customers</div>
          <div className="text-2xl font-black mt-1">{customers.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Tasks</div>
          <div className="text-2xl font-black mt-1">{taskStats.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">In progress</div>
          <div className="text-2xl font-black mt-1">{taskStats.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Done</div>
          <div className="text-2xl font-black mt-1">{taskStats.done}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="font-black">Export</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Gera um CSV baseado nas tasks (para simular relatório / download).
            </div>
          </div>
          <button
            onClick={downloadCSV}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
          >
            Download Tasks CSV
          </button>
        </div>
      </div>
    </div>
  );
}
