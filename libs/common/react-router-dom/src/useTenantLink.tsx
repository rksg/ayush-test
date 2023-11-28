import _        from 'lodash'
import {
  useParams,
  resolvePath,
  useLocation
}         from 'react-router-dom'

import { get } from '@acx-ui/config'

import { MLISA_BASE_PATH } from '.'

import type { Path, To } from 'react-router-dom'

export type TenantType = 't' | 'v'

/**
 * Generate URL for current tenant in URL scope
 */
export function useTenantLink (to: To, tenantType: TenantType = 't') {
  const isRa = get('IS_MLISA_SA')
  const { tenantId } = useParams()
  if (isRa) {
    if (typeof to === 'string') {
      to = to.replace('analytics', '')
    } else {
      if (to.pathname) {
        to.pathname = to.pathname.replace('analytics', '')
      }
    }
  }
  const path: Partial<Path> = resolvePath(to)
  path.pathname = _.trim(path.pathname, '/')
  const search = new URLSearchParams(useLocation().search)
  const newSearch = new URLSearchParams(path.search)
  for (const [name, value] of newSearch.entries()) {
    search.set(name, value)
  }
  path.search = search.toString()
  return resolvePath(path, isRa ? MLISA_BASE_PATH : `/${tenantId}/${tenantType}`)
}
