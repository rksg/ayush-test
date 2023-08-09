import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { NetworkTypeEnum }        from '@acx-ui/rc/utils'

import NetworkFormContext     from '../../NetworkFormContext'
import * as UI                from '../styledComponents'
import { UserConnectionForm } from '../UserConnectionForm'

import QoS from './QoS'


export function AdvancedTab () {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)
  const qosMirroringFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MIRRORING_TOGGLE)
  const isSupportQosMap = false //useIsSplitOn(Features.xxxx)


  const UserConnectionComponent = () => {
    return (
      <div style={{ maxWidth: '600px' }}>
        <UserConnectionForm />
      </div>
    )
  }

  return (
    <>
      { qosMirroringFlag && <QoS /> }
      {isSupportQosMap &&
      <>
        <UI.Subtitle>{$t({ defaultMessage: 'QoS Map' })}</UI.Subtitle>
        <div> implementing... </div>
      </>}

      {data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
        <UserConnectionComponent/>
      }
    </>
  )
}
