
import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'
import { AAAPolicyType }          from '@acx-ui/rc/utils'

export default function AAAOverview (props: { aaaProfile: AAAPolicyType }) {
  const { $t } = useIntl()
  const { aaaProfile } = props

  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Tags' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.tags?.toString()}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Type' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.radiusServer? 'RADIUS':'TACACS+'}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Server Address' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.radiusServer?.serverAddress||
            aaaProfile.tacacsServer?.serverAddress}</Typography.Text>
        </GridCol>
        {aaaProfile.tacacsServer&&<GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'TACACS+ Port' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.tacacsServer.tacacsPort}</Typography.Text>
        </GridCol>}
        {aaaProfile.radiusServer&&<GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Authentication Port' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.radiusServer.authPort}</Typography.Text>
        </GridCol>}
        {aaaProfile.radiusServer&&<GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Accounting Port' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.radiusServer.acctPort}</Typography.Text>
        </GridCol>}
        {aaaProfile.radiusServer&&<GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Cloudpath' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.radiusServer.isCloudpath?$t({ defaultMessage: 'Yes' }):
            $t({ defaultMessage: 'No' })}</Typography.Text>
        </GridCol>}
        {aaaProfile.tacacsServer&&<GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Purpose' })}
          </Card.Title>
          <Typography.Text>{aaaProfile.tacacsServer.purpose}</Typography.Text>
        </GridCol>}
      </GridRow>

    </Card>
  )
}
