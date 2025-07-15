import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import {
  NetworkSaveData
} from '@acx-ui/rc/utils'

import { AaaSummary }            from './AaaSummary'
import { MacAuthenticationInfo } from './MacAuthenticationInfo'

type OpenSummaryFormProps = {
  summaryData: NetworkSaveData
}

export const OpenSummaryForm = (props: OpenSummaryFormProps) => {
  const { summaryData } = props
  // eslint-disable-next-line max-len
  const isSupportNetworkRadiusAccounting = useIsSplitOn(Features.WIFI_NETWORK_RADIUS_ACCOUNTING_TOGGLE)

  const isDisplayAuth = (summaryData.authRadius && summaryData.wlan?.macAddressAuthentication &&
    !summaryData.wlan?.isMacRegistrationList)

  const isDisplayAccounting = (isSupportNetworkRadiusAccounting) ? true : isDisplayAuth

  return (
    <>
      <MacAuthenticationInfo summaryData={summaryData} />
      <AaaSummary
        summaryData={summaryData}
        isDisplayAuth={isDisplayAuth}
        isDisplayAccounting={isDisplayAccounting}
      />
    </>
  )
}
