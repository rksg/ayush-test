import { useGetTenantAllowedOperations }   from '@acx-ui/rc/components'
import { getJwtTokenPayload, getTenantId } from '@acx-ui/utils'

import { RolesMappingDic } from './role-mapping'

export function useHasPermissions (buttonId: string): boolean {
  let isAllowed = false
  let { tenantId } = getJwtTokenPayload()
  if (!tenantId) {
    tenantId = getTenantId()
  }
  const data: string[] = useGetTenantAllowedOperations(tenantId)
  if (RolesMappingDic.hasOwnProperty(buttonId)) {
    const actions = RolesMappingDic[buttonId]
    actions.forEach(el => {
      isAllowed = isAllowed || data.filter(op => op === el.action).length > 0
    })
  }
  return isAllowed
}
