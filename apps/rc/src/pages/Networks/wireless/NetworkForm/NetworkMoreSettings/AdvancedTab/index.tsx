import { useContext } from 'react'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { NetworkTypeEnum }        from '@acx-ui/rc/utils'

import NetworkFormContext     from '../../NetworkFormContext'
import { UserConnectionForm } from '../UserConnectionForm'

import QoS from './QoS'


export function AdvancedTab () {
  const { data } = useContext(NetworkFormContext)
  const qosMirroringFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MIRRORING_TOGGLE)


  const UserConnectionComponent = () => {
    return (
      <div style={{ maxWidth: '600px' }}>
        <UserConnectionForm />
      </div>
    )
  }

  return (
    <>
      { qosMirroringFlag && <QoS wlanData={data} /> }
      {data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
        <UserConnectionComponent/>
      }
    </>
  )
}
