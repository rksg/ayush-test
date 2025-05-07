import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { useGetEnhancedWifiCallingServiceListQuery } from '@acx-ui/rc/services'

export const WIFICALLING_LIMIT_NUMBER = 5

export function useIsWifiCallingProfileLimitReached () {
  const params = useParams()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const { data } = useGetEnhancedWifiCallingServiceListQuery({
    params,
    payload: { fields: ['id'] },
    enableRbac
  })

  return { isLimitReached: (data?.totalCount ?? 0) >= WIFICALLING_LIMIT_NUMBER }
}
