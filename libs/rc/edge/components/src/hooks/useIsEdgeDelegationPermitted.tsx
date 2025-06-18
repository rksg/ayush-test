import { TenantType, useUserProfileContext } from '@acx-ui/user'

export const useIsEdgeDelegationPermitted = () => {
  const { tenantType } = useUserProfileContext()
  return tenantType === TenantType.MSP || tenantType === TenantType.MSP_NON_VAR
}