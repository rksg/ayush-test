import { useMemo } from 'react'

import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import { RolesEnum }                       from '@acx-ui/types'
import { hasRoles, useUserProfileContext } from '@acx-ui/user'
import { AccountType, isDelegationMode }   from '@acx-ui/utils'


export const useEcFilters = () => {
  const { data: userProfile } = useUserProfileContext()
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()

  const ecFilters = useMemo(() => {
    return isPrimeAdmin || isSupportToMspDashboardAllowed
      ? { tenantType: [AccountType.MSP_EC] }
      : { mspAdmins: [userProfile?.adminId], tenantType: [AccountType.MSP_EC] }
  }, [isPrimeAdmin, isSupportToMspDashboardAllowed])

  return ecFilters
}
