import { Features }                          from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }             from '@acx-ui/rc/utils'
import { TenantType, useUserProfileContext } from '@acx-ui/user'

export const useIsEdgeDelegationPermitted = () => {
  const { tenantType } = useUserProfileContext()
  const isEdgeDelegationEnabled = useIsEdgeFeatureReady(Features.EDGE_DELEGATION_POC_TOGGLE)
  // eslint-disable-next-line max-len
  return isEdgeDelegationEnabled && (tenantType === TenantType.MSP || tenantType === TenantType.MSP_NON_VAR)
}