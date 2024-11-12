import { useLocation, useSearchParams } from 'react-router-dom'

import { get } from '@acx-ui/config'

// R1
export function getTenantId (pathname = window.location.pathname): string | undefined {
  const matchedIds = pathname?.match(/[a-f0-9]{32}/)
  return matchedIds ? matchedIds[0] : undefined
}

// RAI
export function decodeTenantId (search: URLSearchParams): string | undefined {
  const selected = search.get('selectedTenants')
  return selected && JSON.parse(window.atob(decodeURIComponent(selected)))[0]
}

export function useTenantId () {
  const location = useLocation()
  const [ search ] = useSearchParams()
  if (get('IS_MLISA_SA')) {
    return decodeTenantId(search)
  } else {
    return getTenantId(location.pathname)
  }
}
