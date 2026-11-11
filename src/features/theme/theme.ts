type Theme = 'light' | 'dark';
const key = 'starlift-theme';
const system = window.matchMedia('(prefers-color-scheme: dark)');
let preference: Theme | null = null;
try {
  const saved = localStorage.getItem(key);
  if (saved === 'light' || saved === 'dark') preference = saved;
} catch { /* Storage can be unavailable in private browsers. */ }
const listeners = new Set<() => void>();
export const getTheme = (): Theme => preference ?? (system.matches ? 'dark' : 'light');
function applyTheme() {
  document.documentElement.dataset.theme = getTheme();
  listeners.forEach((listener) => listener());
}
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function toggleTheme() {
  preference = getTheme() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(key, preference); } catch { /* Keep the choice for this session. */ }
  applyTheme();
}
system.addEventListener('change', applyTheme);
window.addEventListener('storage', (event) => {
  if (event.key !== key && event.key !== null) return;
  preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
  applyTheme();
});
applyTheme();
