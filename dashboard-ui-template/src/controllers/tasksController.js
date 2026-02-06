const STORAGE_KEY = 'saas_tasks_v1';

export async function fetchInitialTasks() {
  const res = await fetch('/backend/tasks.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load tasks: ${res.status}`);
  const data = await res.json();
  return data.tasks || [];
}

export function loadTasksFromStorage() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTasksToStorage(tasks) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
