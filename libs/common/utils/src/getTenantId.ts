import { useLocation } from 'react-router-dom'

export function getTenantId (pathname = window.location.pathname): string | undefined {
  const chunks = pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) { return chunks[Number(c) - 1] }
  }
  if (chunks.length === 2) return chunks[1]
  if (chunks.length === 3 && chunks[2] === '') return chunks[1]
  return
}

export function useTenantId () {
  const location = useLocation()
  return getTenantId(location.pathname)
}
