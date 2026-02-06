'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchInitialCustomers,
  loadCustomersFromStorage,
  saveCustomersToStorage,
} from '@/controllers/customersController';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function badge(status) {
  const map = {
    active: 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/25 dark:text-emerald-200 dark:border-emerald-900',
    trial: 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/25 dark:text-amber-200 dark:border-amber-900',
    churned: 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/25 dark:text-rose-200 dark:border-rose-900',
  };
  return map[status] || 'bg-slate-50 text-slate-800 border-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Starter');

  useEffect(() => {
    let mounted = true;

    const fromStorage = loadCustomersFromStorage();
    if (fromStorage) {
      setCustomers(fromStorage);
      setLoading(false);
      return;
    }

    fetchInitialCustomers()
      .then((c) => {
        if (!mounted) return;
        setCustomers(c);
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
    saveCustomersToStorage(customers);
  }, [customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.plan].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [customers, query]);

  const addCustomer = () => {
    const n = name.trim();
    const e = email.trim();
    if (!n || !e) return;

    setCustomers((prev) => [
      {
        id: `c_${Date.now()}`,
        name: n,
        email: e,
        plan,
        status: 'trial',
      },
      ...prev,
    ]);

    setName('');
    setEmail('');
    setPlan('Starter');
  };

  const removeCustomer = (id) => setCustomers((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Customers (Cadastro)</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          CRUD simples de clientes para SaaS: cadastro, plano e status.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Company name"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="billing@email.com"
          />
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <option>Starter</option>
            <option>Pro</option>
            <option>Enterprise</option>
          </select>
          <button
            onClick={addCustomer}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <div className="mt-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            placeholder="Search customers"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-black">Customer list</div>
          <div className="text-xs text-slate-400">Mobile-first table (scroll horizontal)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Company</th>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Email</th>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Plan</th>
                <th className="text-left p-3 text-xs font-black uppercase tracking-widest">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-slate-500 dark:text-slate-400" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : null}

              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="p-3 font-extrabold">{c.name}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{c.email}</td>
                  <td className="p-3">
                    <span className="text-xs font-extrabold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                      {c.plan}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cx('text-xs font-extrabold px-2 py-1 rounded-lg border', badge(c.status))}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => removeCustomer(c.id)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 ? (
                <tr>
                  <td className="p-4 text-slate-500 dark:text-slate-400" colSpan={5}>
                    No customers.
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
