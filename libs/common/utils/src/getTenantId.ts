import { useLocation } from 'react-router-dom'


export function getTenantId (pathname = window.location.pathname): string | undefined {
  const matchedIds = pathname.match(/[a-f0-9]{32}/)
  return matchedIds ? matchedIds[0] : ''
}

export function useTenantId () {
  const location = useLocation()
  return getTenantId(location.pathname)
}
