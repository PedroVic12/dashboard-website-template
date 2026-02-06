export async function fetchDashboardData() {
  const res = await fetch('/backend/dashboard.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load dashboard data: ${res.status}`);
  }
  return res.json();
}
