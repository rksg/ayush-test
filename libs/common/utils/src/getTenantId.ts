import { useLocation } from '@acx-ui/react-router-dom'

export function extractTenantIdFromPathname (pathname: string): string | undefined {
  const chunks = pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) { return chunks[Number(c) + 1] }
  }
  return
}

export function getTenantId () {
  return extractTenantIdFromPathname(window.location.pathname)
}

export function useTenantId () {
  const location = useLocation()
  return extractTenantIdFromPathname(location.pathname)
}
