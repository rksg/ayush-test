import { useGetTenantAllowedOperations }   from '@acx-ui/rc/components'
import { getJwtTokenPayload, getTenantId } from '@acx-ui/utils'

import { RolesMappingDic } from './role-mapping'

export function useHasPermissions (buttonId: string): boolean {
  let isAllowed = false
  let { tenantId } = getJwtTokenPayload()
  if (!tenantId) { // when jwt FF is disabled
    tenantId = getTenantId()
  }
  const data: string[] = useGetTenantAllowedOperations(tenantId)
  if (RolesMappingDic.hasOwnProperty(buttonId)) {
    const actions = RolesMappingDic[buttonId]
    isAllowed = actions.some(el => data.includes(el.action))
  }
  return isAllowed
}
