const STORAGE_KEY = 'saas_customers_v1';

export async function fetchInitialCustomers() {
  const res = await fetch('/backend/customers.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load customers: ${res.status}`);
  const data = await res.json();
  return data.customers || [];
}

export function loadCustomersFromStorage() {
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

export function saveCustomersToStorage(customers) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}
