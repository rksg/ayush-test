import { useLocation } from 'react-router-dom'

export function extractTenantId(path: string, matchedPattern: string): string | undefined {
  const c: string = path.split(matchedPattern)[1]
  const tid: string = c.split('/')[0]
  return tid
}
export function getTenantId (pathname = window.location.pathname): string | undefined {
  if (pathname === '/') return undefined
  /* support for old url patterns to redirect */
  const patterns = [
    '/t/',
    '/v/',
    '/api/ui-beta/t/',
    '/api/ui-beta/v/'
  ]
  for (const pattern of patterns) {
    if (pathname.startsWith(pattern)) return extractTenantId(pathname, pattern)
  }
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
