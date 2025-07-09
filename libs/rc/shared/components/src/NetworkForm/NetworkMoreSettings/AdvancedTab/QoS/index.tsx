
import { useIntl } from 'react-intl'

import { StepsForm }                      from '@acx-ui/components'
import { TierFeatures, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { NetworkSaveData }                from '@acx-ui/rc/utils'

import { QosMapSetForm } from './QosMapSetForm'
import QoSMirroring      from './QoSMirroring'


export enum QoSMirroringScope {
  MSCS_REQUESTS_ONLY = 'MSCS_REQUESTS_ONLY',
  ALL_CLIENTS = 'ALL_CLIENTS'
}

function QoS ({ wlanData }: { wlanData: NetworkSaveData | null }) {
  const { $t } = useIntl()
  const enableAP70 = useIsTierAllowed(TierFeatures.AP_70)

  return (
    <>
      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'QoS' })}
      </StepsForm.Subtitle>
      { enableAP70 && <QoSMirroring wlanData={wlanData} /> }
      <QosMapSetForm />
    </>
  )
}


export default QoS
