
import { useIntl } from 'react-intl'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { NetworkSaveData }                                        from '@acx-ui/rc/utils'

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
  const enableAP70 = useIsTierAllowed(TierFeatures.AP_70)

  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'QoS' })}
      </UI.Subtitle>
      { qosMirroringFlag && enableAP70 && <QoSMirroring wlanData={wlanData} /> }
      { qosMapSetFlag && <QosMapSetForm /> }
    </>
  )
}


export default QoS
