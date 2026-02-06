'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/tasks', label: 'Tasks' },
  { href: '/dashboard/customers', label: 'Customers' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/dashboard/settings', label: 'Settings' },
];

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cx(
            'fixed md:sticky md:top-0 z-40 h-screen w-[85vw] max-w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm md:shadow-none transition-transform duration-200 ease-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="font-black tracking-tight">
              UI<span className="text-blue-600">UX</span> Pro
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cx(
                    'block px-3 py-2 rounded-xl text-sm font-extrabold border transition',
                    active
                      ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
                      : 'text-slate-700 border-transparent hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Mobile-first shell • dark mode • notifications
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen ? (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        {/* Main */}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Menu
            </button>

            <div className="flex-1 relative">
              <input
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search projects, tasks, tags..."
              />
            </div>

            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>

            <NotificationsButton />
          </header>

          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch('/backend/dashboard.json')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const fromStorage = window.localStorage.getItem('notifications');
        if (fromStorage) {
          try {
            setItems(JSON.parse(fromStorage));
            return;
          } catch {}
        }
        setItems(data.notifications || []);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('notifications', JSON.stringify(items));
  }, [items]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800"
        aria-label="Open notifications"
      >
        Notifs
        {unreadCount > 0 ? (
          <span className="absolute -top-2 -right-2 text-[10px] font-black bg-rose-600 text-white rounded-full px-2 py-0.5">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-[92vw] max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="font-black">Notifications</div>
            <button
              onClick={markAllRead}
              className="text-xs font-extrabold px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No notifications.</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                  className={cx(
                    'w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800',
                    !n.read ? 'bg-blue-50/50 dark:bg-slate-800/60' : ''
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-sm">{n.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.body}</div>
                    </div>
                    <div className="text-[10px] font-black text-slate-400">{n.time}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-2 flex justify-end">
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-extrabold px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
