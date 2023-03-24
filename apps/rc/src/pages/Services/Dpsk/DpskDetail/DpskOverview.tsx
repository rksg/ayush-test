/* eslint-disable align-import/align-import */
import { Typography } from 'antd'

import { Card, GridRow, GridCol } from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  DpskNetworkType,
  DpskSaveData,
  PolicyDefaultAccess,
  transformAdvancedDpskExpirationText,
  transformDpskNetwork
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { defaultAccessLabelMapping } from '../contentsMap'

import { unlimitedNumberOfDeviceLabel } from './contentsMap'
import DpskInstancesTable from './DpskInstancesTable'

export interface DpskOverviewProps {
  data?: DpskSaveData
}

export default function DpskOverview (props: DpskOverviewProps) {
  const intl = getIntl()
  const isCloudpathEnabled = useIsSplitOn(Features.DPSK_CLOUDPATH_FEATURE)
  const { data } = props

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <Card>
          <GridRow>
            <GridCol col={{ span: 5 }}>
              <Card.Title>{intl.$t({ defaultMessage: 'Passphrase Format' })}</Card.Title>
              <Typography.Paragraph>
                {data && transformDpskNetwork(intl, DpskNetworkType.FORMAT, data.passphraseFormat)}
              </Typography.Paragraph>
            </GridCol>
            <GridCol col={{ span: 5 }}>
              <Card.Title>{intl.$t({ defaultMessage: 'Passphrase Length' })}</Card.Title>
              <Typography.Paragraph>
                {data && transformDpskNetwork(intl, DpskNetworkType.LENGTH, data.passphraseLength)}
              </Typography.Paragraph>
            </GridCol>
            <GridCol col={{ span: 5 }}>
              <Card.Title>{intl.$t({ defaultMessage: 'Passphrase Expiration' })}</Card.Title>
              <Typography.Paragraph>
                {data && transformAdvancedDpskExpirationText(
                  intl,
                  {
                    expirationType: data.expirationType,
                    expirationDate: data.expirationDate,
                    expirationOffset: data.expirationOffset
                  }
                )}
              </Typography.Paragraph>
            </GridCol>
          </GridRow>
          {isCloudpathEnabled &&
            <GridRow>
              <GridCol col={{ span: 5 }}>
                <Card.Title>
                  {intl.$t({ defaultMessage: 'Devices allowed per passphrase' })}
                </Card.Title>
                <Typography.Paragraph>
                  {data && (data.deviceCountLimit
                    ? data?.deviceCountLimit
                    : intl.$t(unlimitedNumberOfDeviceLabel))
                  }
                </Typography.Paragraph>
              </GridCol>
              <GridCol col={{ span: 5 }}>
                <Card.Title>{intl.$t({ defaultMessage: 'Default Access' })}</Card.Title>
                <Typography.Paragraph>
                  {data && intl.$t(defaultAccessLabelMapping[
                    data.policyDefaultAccess === false
                      ? PolicyDefaultAccess.REJECT
                      : PolicyDefaultAccess.ACCEPT
                  ])}
                </Typography.Paragraph>
              </GridCol>
            </GridRow>
          }
        </Card>
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <Card>
          <DpskInstancesTable networkIds={data?.networkIds} />
        </Card>
      </GridCol>
    </GridRow>
  )
}
