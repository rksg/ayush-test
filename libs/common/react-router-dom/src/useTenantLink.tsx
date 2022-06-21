import _                          from 'lodash'
import { useParams, resolvePath } from 'react-router-dom'

import { useBasePath } from './helpers'

import type { Path, To } from 'react-router-dom'

/**
 * Generate URL for current tenant in URL scope
 */
export function useTenantLink (to: To) {
  const { tenantId } = useParams()
  const path: Partial<Path> = resolvePath(to)
  path.pathname = _.trim(path.pathname, '/')
  return resolvePath(path, `${useBasePath()}/t/${tenantId}`)
}
