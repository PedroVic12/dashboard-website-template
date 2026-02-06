'use client';

import React, { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const t = window.localStorage.getItem('theme');
    if (t === 'dark' || t === 'light') setTheme(t);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight">Settings</h1>
      <p className="text-slate-500 dark:text-slate-400">
        Rota real: <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">/dashboard/settings</code>
      </p>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="font-black">Appearance</div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="font-extrabold">Theme</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Toggle light/dark</div>
          </div>
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </div>
  );
}
