import { useLocation } from 'react-router-dom'

function extractTenantId (
  path: string,
  matchedPattern: string,
  isTrailing: boolean = true
): string | undefined {
  if (!matchedPattern.endsWith('/')) matchedPattern += '/'
  const c: string = isTrailing ? path.split(matchedPattern)[0] : path.split(matchedPattern)[1]
  const tid: string = isTrailing ? c.split('/')[1] : c.split('/')[0]
  return tid
}
export function getTenantId (pathname = window.location.pathname): string | undefined {
  if (pathname === '/') return undefined
  /* support for old url patterns to redirect */
  const oldPattern = [
    '/t/',
    '/v/',
    '/api/ui-beta/t/',
    '/api/ui-beta/v/'
  ].find(pattern => pathname.startsWith(pattern))
  if (oldPattern) return extractTenantId(pathname, oldPattern, false)

  // /:tenantId/t | /:tenantId/v | '/123/t/' | '/123/v/some-path'
  const newPattern = ['/t', '/v'].find(pattern => pathname.endsWith(pattern))
  ?? ['/t/', '/v/'].find(pattern => pathname.includes(pattern))

  if (newPattern) return extractTenantId(pathname, newPattern)

  // const chunks = pathname.split('/')
  // for (const c in chunks) {
  //   if (['v', 't'].includes(chunks[c])) { return chunks[Number(c) - 1] }
  // }
  // if (chunks.length === 2) return chunks[1]
  // if (chunks.length === 3 && chunks[2] === '') return chunks[1]
  return
}

export function useTenantId () {
  const location = useLocation()
  return getTenantId(location.pathname)
}
