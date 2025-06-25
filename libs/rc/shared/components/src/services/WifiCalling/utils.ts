import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { useGetEnhancedWifiCallingServiceListQuery }   from '@acx-ui/rc/services'
import { getServiceProfileMaximumNumber, ServiceType } from '@acx-ui/rc/utils'

export function useIsWifiCallingProfileLimitReached () {
  const params = useParams()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const { data } = useGetEnhancedWifiCallingServiceListQuery({
    params,
    payload: { fields: ['id'] },
    enableRbac
  })

  return {
    // eslint-disable-next-line max-len
    isLimitReached: (data?.totalCount ?? 0) >= getServiceProfileMaximumNumber(ServiceType.WIFI_CALLING)
  }
}
