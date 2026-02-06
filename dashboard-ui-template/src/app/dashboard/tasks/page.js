'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchInitialTasks,
  loadTasksFromStorage,
  saveTasksToStorage,
} from '@/controllers/tasksController';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function pill(priority) {
  const map = {
    high: 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900',
    medium: 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/25 dark:text-amber-200 dark:border-amber-900',
    low: 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/25 dark:text-emerald-200 dark:border-emerald-900',
  };
  return map[priority] || 'bg-slate-50 text-slate-800 border-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
}

const STATUS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    let mounted = true;

    const fromStorage = loadTasksFromStorage();
    if (fromStorage) {
      setTasks(fromStorage);
      setLoading(false);
      return;
    }

    fetchInitialTasks()
      .then((initial) => {
        if (!mounted) return;
        setTasks(initial);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const statusOk = statusFilter === 'all' || t.status === statusFilter;
      const queryOk = !q || (t.title || '').toLowerCase().includes(q);
      return statusOk && queryOk;
    });
  }, [tasks, statusFilter, query]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress' && !t.done).length;
    return { total, done, inProgress };
  }, [tasks]);

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;

    setTasks((prev) => [
      {
        id: `t_${Date.now()}`,
        title,
        status: 'todo',
        priority: 'medium',
        assignee: 'You',
        due: '',
        done: false,
      },
      ...prev,
    ]);
    setNewTitle('');
  };

  const toggleDone = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
              status: !t.done ? 'done' : 'todo',
            }
          : t
      )
    );
  };

  const updateTask = (id, patch) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const removeTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Tasks (CRUD)</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Dashboard SaaS: lista de tarefas como centro do sistema (cadastro/relatórios partem daqui).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Total</div>
          <div className="text-2xl font-black mt-1">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">In progress</div>
          <div className="text-2xl font-black mt-1">{stats.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Done</div>
          <div className="text-2xl font-black mt-1">{stats.done}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Quick add</div>
            <div className="mt-2 flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask();
                }}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nova tarefa..."
              />
              <button
                onClick={addTask}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Filters</div>
            <div className="mt-2 flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                {STATUS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                placeholder="Search"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-black">Task list</div>
          <div className="text-xs text-slate-400">Mobile-first table (scroll horizontal)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Done</th>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Title</th>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Status</th>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Priority</th>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Assignee</th>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Due</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-slate-500 dark:text-slate-400" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : null}

              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="p-3">
                    <input type="checkbox" checked={!!t.done} onChange={() => toggleDone(t.id)} className="h-5 w-5" />
                  </td>
                  <td className="p-3">
                    <input
                      value={t.title}
                      onChange={(e) => updateTask(t.id, { title: e.target.value })}
                      className={cx(
                        'w-full bg-transparent outline-none font-extrabold',
                        t.done ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      )}
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={t.status}
                      onChange={(e) => updateTask(t.id, { status: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={t.priority}
                      onChange={(e) => updateTask(t.id, { priority: e.target.value })}
                      className={cx('px-3 py-2 rounded-xl border', pill(t.priority))}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      value={t.assignee || ''}
                      onChange={(e) => updateTask(t.id, { assignee: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      placeholder="Name"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="date"
                      value={t.due || ''}
                      onChange={(e) => updateTask(t.id, { due: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => removeTask(t.id)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 ? (
                <tr>
                  <td className="p-4 text-slate-500 dark:text-slate-400" colSpan={7}>
                    No tasks.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
