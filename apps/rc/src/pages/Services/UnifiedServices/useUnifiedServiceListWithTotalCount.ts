import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import {
  useAccessControlsCountQuery, useGetAAAPolicyViewModelListQuery,
  useGetEnhancedAccessControlProfileListQuery
} from '@acx-ui/rc/services'
import { ExtendedUnifiedService, PolicyType, UnifiedService, UnifiedServiceType, useUnifiedServicesList } from '@acx-ui/rc/utils'

const defaultPayload = { fields: ['id'] }

// eslint-disable-next-line max-len
export function useUnifiedServiceListWithTotalCount (): Array<ExtendedUnifiedService> {
  const params = useParams()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const unifiedServiceList = useUnifiedServicesList()

  const typeToTotalCount: Partial<Record<UnifiedServiceType, number | undefined>> = {
    // eslint-disable-next-line max-len
    [PolicyType.AAA]: useGetAAAPolicyViewModelListQuery({ params, payload: {}, enableRbac }).data?.totalCount,
    [PolicyType.ACCESS_CONTROL]: useAclTotalCount()
  }

  return unifiedServiceList.map((service: UnifiedService) => ({
    ...service,
    totalCount: typeToTotalCount[service.type] ?? 0
  }))
}

function useAclTotalCount (): number | undefined {
  const params = useParams()
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const aclTotalCount = useGetEnhancedAccessControlProfileListQuery({
    params,
    payload: { ...defaultPayload, noDetails: true },
    enableRbac
  }, { skip: isSwitchMacAclEnabled }).data?.totalCount

  const switchMacAclTotalCount =
    Number(useGetEnhancedAccessControlProfileListQuery({
      params,
      payload: { ...defaultPayload, noDetails: true },
      enableRbac
    }, { skip: !isSwitchMacAclEnabled }).data?.totalCount ?? 0)
    + Number(useAccessControlsCountQuery({ params }, { skip: !isSwitchMacAclEnabled }).data ?? 0)

  return isSwitchMacAclEnabled ? switchMacAclTotalCount : aclTotalCount
}
