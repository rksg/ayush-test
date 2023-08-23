
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { NetworkSaveData }        from '@acx-ui/rc/utils'

import * as UI from '../../../NetworkMoreSettings/styledComponents'

import { QosMapSetForm } from './QosMapSetForm'
import QoSMirroring      from './QoSMirroring'


export enum QoSMirroringScope {
  MSCS_REQUESTS_ONLY = 'MSCS_REQUESTS_ONLY',
  ALL_CLIENTS = 'ALL_CLIENTS'
}

function QoS ({ wlanData }: { wlanData: NetworkSaveData | null }) {
  const { $t } = useIntl()
  const qosMapSetFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MAP_SET_TOGGLE)
  const qosMirroringFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MIRRORING_TOGGLE)

  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'QoS' })}
      </UI.Subtitle>
      { qosMirroringFlag && <QoSMirroring wlanData={wlanData} /> }
      { qosMapSetFlag && <QosMapSetForm /> }
    </>
  )
}


export default QoS