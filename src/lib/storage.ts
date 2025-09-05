export const safeGet = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
export const safeSet = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}
