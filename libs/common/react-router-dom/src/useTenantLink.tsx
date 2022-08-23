import _        from 'lodash'
import {
  useParams,
  resolvePath,
  useLocation
}         from 'react-router-dom'

import { useBasePath } from './helpers'

import type { Path, To } from 'react-router-dom'

export type TenantType = 't' | 'v'

/**
 * Generate URL for current tenant in URL scope
 */
export function useTenantLink (to: To, tenantType: TenantType = 't') {
  const { tenantId } = useParams()
  const path: Partial<Path> = resolvePath(to)
  path.pathname = _.trim(path.pathname, '/')
  const search = new URLSearchParams(useLocation().search)
  const newSearch = new URLSearchParams(path.search)
  for (const [name, value] of newSearch.entries()) {
    search.set(name, value)
  }
  path.search = search.toString()
  return resolvePath(path, `${useBasePath()}/${tenantType}/${tenantId}`)
}
