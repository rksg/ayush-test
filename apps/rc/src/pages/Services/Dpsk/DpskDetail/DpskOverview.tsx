import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridRow, GridCol } from '@acx-ui/components'
import {
  DpskNetworkType,
  DpskSaveData,
  transformAdvancedDpskExpirationText,
  transformDpskNetwork
} from '@acx-ui/rc/utils'

import DpskInstancesTable from './DpskInstancesTable'

export interface DpskOverviewProps {
  data?: DpskSaveData
}

export default function DpskOverview (props: DpskOverviewProps) {
  const intl = useIntl()
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
