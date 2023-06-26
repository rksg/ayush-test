
import { Card, GridCol, GridRow, SummaryCard } from '@acx-ui/components'
import { Features, useIsTierAllowed }          from '@acx-ui/feature-toggle'
import {
  DpskNetworkType,
  DpskSaveData,
  displayDeviceCountLimit,
  transformAdvancedDpskExpirationText,
  transformDpskNetwork
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { displayDefaultAccess } from '../utils'

import DpskInstancesTable from './DpskInstancesTable'

export interface DpskOverviewProps {
  data?: DpskSaveData
}

export default function DpskOverview (props: DpskOverviewProps) {
  const intl = getIntl()
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const { data } = props

  const dpskInfo = [
    {
      title: intl.$t({ defaultMessage: 'Passphrase Format' }),
      content: data && transformDpskNetwork(intl, DpskNetworkType.FORMAT, data.passphraseFormat)
    },
    {
      title: intl.$t({ defaultMessage: 'Passphrase Length' }),
      content: data && transformDpskNetwork(intl, DpskNetworkType.LENGTH, data.passphraseLength)
    },
    {
      title: intl.$t({ defaultMessage: 'Passphrase Expiration' }),
      content: data && transformAdvancedDpskExpirationText(
        intl,
        {
          expirationType: data.expirationType,
          expirationDate: data.expirationDate,
          expirationOffset: data.expirationOffset
        }
      )
    },
    {
      title: intl.$t({ defaultMessage: 'Devices allowed per passphrase' }),
      content: data && displayDeviceCountLimit(data.deviceCountLimit),
      visible: isCloudpathEnabled
    },
    {
      title: intl.$t({ defaultMessage: 'Default Access' }),
      content: data && displayDefaultAccess(data.policyDefaultAccess),
      visible: isCloudpathEnabled
    }
  ]

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <SummaryCard data={dpskInfo} />
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <Card>
          <DpskInstancesTable networkIds={data?.networkIds} />
        </Card>
      </GridCol>
    </GridRow>
  )
}
