import _     from 'lodash'
import {
  useParams,
  resolvePath,
  useLocation,
  Params,
  Location
}         from 'react-router-dom'

import { get } from '@acx-ui/config'

import { MLISA_BASE_PATH } from '.'

import type { Path, To } from 'react-router-dom'

export type TenantType = 't' | 'v'

export function getTenantLink (
  params: Params<string>,
  to: To,
  location: Location,
  tenantType: TenantType = 't'
) {
  const isRa = get('IS_MLISA_SA')
  const { tenantId } = params
  const path: Partial<Path> = resolvePath(to)
  if (isRa) {
    path.pathname = path.pathname?.replace('/analytics', '')
  }
  path.pathname = _.trim(path.pathname, '/')
  const search = new URLSearchParams(location.search)
  const newSearch = new URLSearchParams(path.search)
  for (const [name, value] of newSearch.entries()) {
    search.set(name, value)
  }
  path.search = search.toString()
  return resolvePath(path, isRa ? MLISA_BASE_PATH : `/${tenantId}/${tenantType}`)
}

/**
 * Generate URL for current tenant in URL scope
 */
export function useTenantLink (to: To, tenantType: TenantType = 't') {
  const params = useParams()
  const location = useLocation()
  return getTenantLink(params, to, location, tenantType)
}
