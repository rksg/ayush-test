import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { RadiusOptionsForm }                                      from '@acx-ui/rc/components'
import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import NetworkFormContext                     from '../../NetworkFormContext'
import { hasAccountingRadius, hasAuthRadius } from '../../utils'
import * as UI                                from '../styledComponents'
import { UserConnectionForm }                 from '../UserConnectionForm'


export function AdvancedTab (props: { wlanData: NetworkSaveData | null }) {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)
  const { wlanData } = props

  const isSupportQosMap = false //useIsSplitOn(Features.xxxx)
  const isRadiusOptionsSupport = useIsSplitOn(Features.RADIUS_OPTIONS)

  const showRadiusOptions = isRadiusOptionsSupport && hasAuthRadius(data, wlanData)
  const showSingleSessionIdAccounting = hasAccountingRadius(data, wlanData)

  const UserConnectionComponent = () => {
    return (<UserConnectionForm />)
  }

  return (
    <>
      {isSupportQosMap &&
      <>
        <UI.Subtitle>{$t({ defaultMessage: 'QoS Map' })}</UI.Subtitle>
        <div> implementing... </div>
      </>}

      {showRadiusOptions &&
      <>
        <UI.Subtitle>{$t({ defaultMessage: 'RADIUS Options' })}</UI.Subtitle>
        <RadiusOptionsForm context='network'
          isWispr={data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr}
          showSingleSessionIdAccounting={showSingleSessionIdAccounting} />
      </>}

      {data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
        <UserConnectionComponent/>
      }
    </>
  )
}
